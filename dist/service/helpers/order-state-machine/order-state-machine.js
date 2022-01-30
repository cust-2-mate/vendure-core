"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStateMachine = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const unique_1 = require("@vendure/common/lib/unique");
const errors_1 = require("../../../common/error/errors");
const finite_state_machine_1 = require("../../../common/finite-state-machine/finite-state-machine");
const merge_transition_definitions_1 = require("../../../common/finite-state-machine/merge-transition-definitions");
const validate_transition_definition_1 = require("../../../common/finite-state-machine/validate-transition-definition");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const transactional_connection_1 = require("../../../connection/transactional-connection");
const order_modification_entity_1 = require("../../../entity/order-modification/order-modification.entity");
const order_entity_1 = require("../../../entity/order/order.entity");
const payment_entity_1 = require("../../../entity/payment/payment.entity");
const product_variant_entity_1 = require("../../../entity/product-variant/product-variant.entity");
const order_placed_event_1 = require("../../../event-bus/events/order-placed-event");
const index_1 = require("../../../event-bus/index");
const history_service_1 = require("../../services/history.service");
const promotion_service_1 = require("../../services/promotion.service");
const stock_movement_service_1 = require("../../services/stock-movement.service");
const order_utils_1 = require("../utils/order-utils");
const order_state_1 = require("./order-state");
let OrderStateMachine = class OrderStateMachine {
    constructor(connection, configService, stockMovementService, historyService, promotionService, eventBus) {
        this.connection = connection;
        this.configService = configService;
        this.stockMovementService = stockMovementService;
        this.historyService = historyService;
        this.promotionService = promotionService;
        this.eventBus = eventBus;
        this.initialState = 'Created';
        this.config = this.initConfig();
    }
    getInitialState() {
        return this.initialState;
    }
    canTransition(currentState, newState) {
        return new finite_state_machine_1.FSM(this.config, currentState).canTransitionTo(newState);
    }
    getNextStates(order) {
        const fsm = new finite_state_machine_1.FSM(this.config, order.state);
        return fsm.getNextStates();
    }
    async transition(ctx, order, state) {
        const fsm = new finite_state_machine_1.FSM(this.config, order.state);
        await fsm.transitionTo(state, { ctx, order });
        order.state = fsm.currentState;
    }
    async findOrderWithFulfillments(ctx, id) {
        return await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, id, {
            relations: ['lines', 'lines.items', 'lines.items.fulfillments'],
        });
    }
    /**
     * Specific business logic to be executed on Order state transitions.
     */
    async onTransitionStart(fromState, toState, data) {
        if (fromState === 'Modifying') {
            const modifications = await this.connection
                .getRepository(data.ctx, order_modification_entity_1.OrderModification)
                .find({ where: { order: data.order }, relations: ['refund', 'payment'] });
            if (toState === 'ArrangingAdditionalPayment') {
                if (0 < modifications.length && modifications.every(modification => modification.isSettled)) {
                    return `message.cannot-transition-no-additional-payments-needed`;
                }
            }
            else {
                if (modifications.some(modification => !modification.isSettled)) {
                    return `message.cannot-transition-without-modification-payment`;
                }
            }
        }
        if (fromState === 'ArrangingAdditionalPayment') {
            if (toState === 'Cancelled') {
                return;
            }
            const existingPayments = await this.connection.getRepository(data.ctx, payment_entity_1.Payment).find({
                relations: ['refunds'],
                where: {
                    order: { id: data.order.id },
                },
            });
            data.order.payments = existingPayments;
            const deficit = data.order.totalWithTax - order_utils_1.totalCoveredByPayments(data.order);
            if (0 < deficit) {
                return `message.cannot-transition-from-arranging-additional-payment`;
            }
        }
        if (fromState === 'AddingItems') {
            const variantIds = unique_1.unique(data.order.lines.map(l => l.productVariant.id));
            const qb = this.connection
                .getRepository(data.ctx, product_variant_entity_1.ProductVariant)
                .createQueryBuilder('variant')
                .leftJoin('variant.product', 'product')
                .where('variant.deletedAt IS NULL')
                .andWhere('product.deletedAt IS NULL')
                .andWhere('variant.id IN (:...variantIds)', { variantIds });
            const availableVariants = await qb.getMany();
            if (availableVariants.length !== variantIds.length) {
                return `message.cannot-transition-order-contains-products-which-are-unavailable`;
            }
        }
        if (toState === 'ArrangingPayment') {
            if (data.order.lines.length === 0) {
                return `message.cannot-transition-to-payment-when-order-is-empty`;
            }
            if (!data.order.customer) {
                return `message.cannot-transition-to-payment-without-customer`;
            }
            if (!data.order.shippingLines || data.order.shippingLines.length === 0) {
                return `message.cannot-transition-to-payment-without-shipping-method`;
            }
        }
        if (toState === 'PaymentAuthorized') {
            const hasAnAuthorizedPayment = !!data.order.payments.find(p => p.state === 'Authorized');
            if (!order_utils_1.orderTotalIsCovered(data.order, ['Authorized', 'Settled']) || !hasAnAuthorizedPayment) {
                return `message.cannot-transition-without-authorized-payments`;
            }
        }
        if (toState === 'PaymentSettled' && !order_utils_1.orderTotalIsCovered(data.order, 'Settled')) {
            return `message.cannot-transition-without-settled-payments`;
        }
        if (toState === 'Cancelled' && fromState !== 'AddingItems' && fromState !== 'ArrangingPayment') {
            if (!order_utils_1.orderItemsAreAllCancelled(data.order)) {
                return `message.cannot-transition-unless-all-cancelled`;
            }
        }
        if (toState === 'PartiallyShipped') {
            const orderWithFulfillments = await this.findOrderWithFulfillments(data.ctx, data.order.id);
            if (!order_utils_1.orderItemsArePartiallyShipped(orderWithFulfillments)) {
                return `message.cannot-transition-unless-some-order-items-shipped`;
            }
        }
        if (toState === 'Shipped') {
            const orderWithFulfillments = await this.findOrderWithFulfillments(data.ctx, data.order.id);
            if (!order_utils_1.orderItemsAreShipped(orderWithFulfillments)) {
                return `message.cannot-transition-unless-all-order-items-shipped`;
            }
        }
        if (toState === 'PartiallyDelivered') {
            const orderWithFulfillments = await this.findOrderWithFulfillments(data.ctx, data.order.id);
            if (!order_utils_1.orderItemsArePartiallyDelivered(orderWithFulfillments)) {
                return `message.cannot-transition-unless-some-order-items-delivered`;
            }
        }
        if (toState === 'Delivered') {
            const orderWithFulfillments = await this.findOrderWithFulfillments(data.ctx, data.order.id);
            if (!order_utils_1.orderItemsAreDelivered(orderWithFulfillments)) {
                return `message.cannot-transition-unless-all-order-items-delivered`;
            }
        }
    }
    /**
     * Specific business logic to be executed after Order state transition completes.
     */
    async onTransitionEnd(fromState, toState, data) {
        const { ctx, order } = data;
        const { stockAllocationStrategy, orderPlacedStrategy } = this.configService.orderOptions;
        if (order.active) {
            const shouldSetAsPlaced = orderPlacedStrategy.shouldSetAsPlaced(ctx, fromState, toState, order);
            if (shouldSetAsPlaced) {
                order.active = false;
                order.orderPlacedAt = new Date();
                await this.promotionService.addPromotionsToOrder(ctx, order);
                this.eventBus.publish(new order_placed_event_1.OrderPlacedEvent(fromState, toState, ctx, order));
            }
        }
        const shouldAllocateStock = await stockAllocationStrategy.shouldAllocateStock(ctx, fromState, toState, order);
        if (shouldAllocateStock) {
            await this.stockMovementService.createAllocationsForOrder(ctx, order);
        }
        if (toState === 'Cancelled') {
            order.active = false;
        }
        await this.historyService.createHistoryEntryForOrder({
            orderId: order.id,
            type: generated_types_1.HistoryEntryType.ORDER_STATE_TRANSITION,
            ctx,
            data: {
                from: fromState,
                to: toState,
            },
        });
    }
    initConfig() {
        var _a;
        const customProcesses = (_a = this.configService.orderOptions.process) !== null && _a !== void 0 ? _a : [];
        const allTransitions = customProcesses.reduce((transitions, process) => merge_transition_definitions_1.mergeTransitionDefinitions(transitions, process.transitions), order_state_1.orderStateTransitions);
        const validationResult = validate_transition_definition_1.validateTransitionDefinition(allTransitions, 'AddingItems');
        return {
            transitions: allTransitions,
            onTransitionStart: async (fromState, toState, data) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionStart === 'function') {
                        const result = await utils_1.awaitPromiseOrObservable(process.onTransitionStart(fromState, toState, data));
                        if (result === false || typeof result === 'string') {
                            return result;
                        }
                    }
                }
                return this.onTransitionStart(fromState, toState, data);
            },
            onTransitionEnd: async (fromState, toState, data) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionEnd === 'function') {
                        await utils_1.awaitPromiseOrObservable(process.onTransitionEnd(fromState, toState, data));
                    }
                }
                await this.onTransitionEnd(fromState, toState, data);
            },
            onError: async (fromState, toState, message) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionError === 'function') {
                        await utils_1.awaitPromiseOrObservable(process.onTransitionError(fromState, toState, message));
                    }
                }
                throw new errors_1.IllegalOperationError(message || 'message.cannot-transition-order-from-to', {
                    fromState,
                    toState,
                });
            },
        };
    }
};
OrderStateMachine = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        stock_movement_service_1.StockMovementService,
        history_service_1.HistoryService,
        promotion_service_1.PromotionService,
        index_1.EventBus])
], OrderStateMachine);
exports.OrderStateMachine = OrderStateMachine;
//# sourceMappingURL=order-state-machine.js.map