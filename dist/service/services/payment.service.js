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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const errors_1 = require("../../common/error/errors");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const generated_graphql_shop_errors_1 = require("../../common/error/generated-graphql-shop-errors");
const utils_1 = require("../../common/utils");
const transactional_connection_1 = require("../../connection/transactional-connection");
const order_entity_1 = require("../../entity/order/order.entity");
const payment_entity_1 = require("../../entity/payment/payment.entity");
const refund_entity_1 = require("../../entity/refund/refund.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const payment_state_transition_event_1 = require("../../event-bus/events/payment-state-transition-event");
const refund_state_transition_event_1 = require("../../event-bus/events/refund-state-transition-event");
const payment_state_machine_1 = require("../helpers/payment-state-machine/payment-state-machine");
const refund_state_machine_1 = require("../helpers/refund-state-machine/refund-state-machine");
const payment_method_service_1 = require("./payment-method.service");
/**
 * @description
 * Contains methods relating to {@link Payment} entities.
 *
 * @docsCategory services
 */
let PaymentService = class PaymentService {
    constructor(connection, paymentStateMachine, refundStateMachine, paymentMethodService, eventBus) {
        this.connection = connection;
        this.paymentStateMachine = paymentStateMachine;
        this.refundStateMachine = refundStateMachine;
        this.paymentMethodService = paymentMethodService;
        this.eventBus = eventBus;
    }
    async create(ctx, input) {
        const newPayment = new payment_entity_1.Payment(Object.assign(Object.assign({}, input), { state: this.paymentStateMachine.getInitialState() }));
        return this.connection.getRepository(ctx, payment_entity_1.Payment).save(newPayment);
    }
    async findOneOrThrow(ctx, id, relations = ['order']) {
        return await this.connection.getEntityOrThrow(ctx, payment_entity_1.Payment, id, {
            relations,
        });
    }
    /**
     * @description
     * Transitions a Payment to the given state.
     *
     * When updating a Payment in the context of an Order, it is
     * preferable to use the {@link OrderService} `transitionPaymentToState()` method, which will also handle
     * updating the Order state too.
     */
    async transitionToState(ctx, paymentId, state) {
        if (state === 'Settled') {
            return this.settlePayment(ctx, paymentId);
        }
        const payment = await this.findOneOrThrow(ctx, paymentId);
        const fromState = payment.state;
        try {
            await this.paymentStateMachine.transition(ctx, payment.order, payment, state);
        }
        catch (e) {
            const transitionError = ctx.translate(e.message, { fromState, toState: state });
            return new generated_graphql_admin_errors_1.PaymentStateTransitionError(transitionError, fromState, state);
        }
        await this.connection.getRepository(ctx, payment_entity_1.Payment).save(payment, { reload: false });
        this.eventBus.publish(new payment_state_transition_event_1.PaymentStateTransitionEvent(fromState, state, ctx, payment, payment.order));
        return payment;
    }
    getNextStates(payment) {
        return this.paymentStateMachine.getNextStates(payment);
    }
    /**
     * @description
     * Creates a new Payment.
     *
     * When creating a Payment in the context of an Order, it is
     * preferable to use the {@link OrderService} `addPaymentToOrder()` method, which will also handle
     * updating the Order state too.
     */
    async createPayment(ctx, order, amount, method, metadata) {
        const { paymentMethod, handler, checker } = await this.paymentMethodService.getMethodAndOperations(ctx, method);
        if (paymentMethod.checker && checker) {
            const eligible = await checker.check(ctx, order, paymentMethod.checker.args);
            if (eligible === false || typeof eligible === 'string') {
                return new generated_graphql_shop_errors_1.IneligiblePaymentMethodError(typeof eligible === 'string' ? eligible : undefined);
            }
        }
        const result = await handler.createPayment(ctx, order, amount, paymentMethod.handler.args, metadata || {});
        const initialState = 'Created';
        const payment = await this.connection
            .getRepository(ctx, payment_entity_1.Payment)
            .save(new payment_entity_1.Payment(Object.assign(Object.assign({}, result), { method, state: initialState })));
        await this.paymentStateMachine.transition(ctx, order, payment, result.state);
        await this.connection.getRepository(ctx, payment_entity_1.Payment).save(payment, { reload: false });
        this.eventBus.publish(new payment_state_transition_event_1.PaymentStateTransitionEvent(initialState, result.state, ctx, payment, order));
        return payment;
    }
    /**
     * @description
     * Settles a Payment.
     *
     * When settling a Payment in the context of an Order, it is
     * preferable to use the {@link OrderService} `settlePayment()` method, which will also handle
     * updating the Order state too.
     */
    async settlePayment(ctx, paymentId) {
        const payment = await this.connection.getEntityOrThrow(ctx, payment_entity_1.Payment, paymentId, {
            relations: ['order'],
        });
        const { paymentMethod, handler } = await this.paymentMethodService.getMethodAndOperations(ctx, payment.method);
        const settlePaymentResult = await handler.settlePayment(ctx, payment.order, payment, paymentMethod.handler.args);
        const fromState = payment.state;
        let toState;
        payment.metadata = this.mergePaymentMetadata(payment.metadata, settlePaymentResult.metadata);
        if (settlePaymentResult.success) {
            toState = 'Settled';
        }
        else {
            toState = settlePaymentResult.state || 'Error';
            payment.errorMessage = settlePaymentResult.errorMessage;
        }
        try {
            await this.paymentStateMachine.transition(ctx, payment.order, payment, toState);
        }
        catch (e) {
            const transitionError = ctx.translate(e.message, { fromState, toState });
            return new generated_graphql_admin_errors_1.PaymentStateTransitionError(transitionError, fromState, toState);
        }
        await this.connection.getRepository(ctx, payment_entity_1.Payment).save(payment, { reload: false });
        this.eventBus.publish(new payment_state_transition_event_1.PaymentStateTransitionEvent(fromState, toState, ctx, payment, payment.order));
        return payment;
    }
    /**
     * @description
     * Creates a Payment from the manual payment mutation in the Admin API
     *
     * When creating a manual Payment in the context of an Order, it is
     * preferable to use the {@link OrderService} `addManualPaymentToOrder()` method, which will also handle
     * updating the Order state too.
     */
    async createManualPayment(ctx, order, amount, input) {
        const initialState = 'Created';
        const endState = 'Settled';
        const payment = await this.connection.getRepository(ctx, payment_entity_1.Payment).save(new payment_entity_1.Payment({
            amount,
            order,
            transactionId: input.transactionId,
            metadata: input.metadata,
            method: input.method,
            state: initialState,
        }));
        await this.paymentStateMachine.transition(ctx, order, payment, endState);
        await this.connection.getRepository(ctx, payment_entity_1.Payment).save(payment, { reload: false });
        this.eventBus.publish(new payment_state_transition_event_1.PaymentStateTransitionEvent(initialState, endState, ctx, payment, order));
        return payment;
    }
    /**
     * @description
     * Creates a Refund against the specified Payment. If the amount to be refunded exceeds the value of the
     * specified Payment (in the case of multiple payments on a single Order), then the remaining outstanding
     * refund amount will be refunded against the next available Payment from the Order.
     *
     * When creating a Refund in the context of an Order, it is
     * preferable to use the {@link OrderService} `refundOrder()` method, which performs additional
     * validation.
     */
    async createRefund(ctx, input, order, items, selectedPayment) {
        var _a, _b, _c, _d;
        const orderWithRefunds = await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, order.id, {
            relations: ['payments', 'payments.refunds'],
        });
        function paymentRefundTotal(payment) {
            var _a, _b;
            const nonFailedRefunds = (_b = (_a = payment.refunds) === null || _a === void 0 ? void 0 : _a.filter(refund => refund.state !== 'Failed')) !== null && _b !== void 0 ? _b : [];
            return shared_utils_1.summate(nonFailedRefunds, 'total');
        }
        const existingNonFailedRefunds = (_b = (_a = orderWithRefunds.payments) === null || _a === void 0 ? void 0 : _a.reduce((refunds, p) => [...refunds, ...p.refunds], []).filter(refund => refund.state !== 'Failed')) !== null && _b !== void 0 ? _b : [];
        const refundablePayments = orderWithRefunds.payments.filter(p => {
            return paymentRefundTotal(p) < p.amount;
        });
        const itemAmount = shared_utils_1.summate(items, 'proratedUnitPriceWithTax');
        let primaryRefund;
        const refundedPaymentIds = [];
        const refundTotal = itemAmount + input.shipping + input.adjustment;
        const refundMax = (_d = (_c = orderWithRefunds.payments) === null || _c === void 0 ? void 0 : _c.map(p => p.amount - paymentRefundTotal(p)).reduce((sum, amount) => sum + amount, 0)) !== null && _d !== void 0 ? _d : 0;
        let refundOutstanding = Math.min(refundTotal, refundMax);
        do {
            const paymentToRefund = (refundedPaymentIds.length === 0 &&
                refundablePayments.find(p => utils_1.idsAreEqual(p.id, selectedPayment.id))) ||
                refundablePayments.find(p => !refundedPaymentIds.includes(p.id)) ||
                refundablePayments[0];
            if (!paymentToRefund) {
                throw new errors_1.InternalServerError(`Could not find a Payment to refund`);
            }
            const amountNotRefunded = paymentToRefund.amount - paymentRefundTotal(paymentToRefund);
            const total = Math.min(amountNotRefunded, refundOutstanding);
            let refund = new refund_entity_1.Refund({
                payment: paymentToRefund,
                total,
                orderItems: items,
                items: itemAmount,
                reason: input.reason,
                adjustment: input.adjustment,
                shipping: input.shipping,
                method: selectedPayment.method,
                state: 'Pending',
                metadata: {},
            });
            const { paymentMethod, handler } = await this.paymentMethodService.getMethodAndOperations(ctx, paymentToRefund.method);
            const createRefundResult = await handler.createRefund(ctx, input, total, order, paymentToRefund, paymentMethod.handler.args);
            if (createRefundResult) {
                refund.transactionId = createRefundResult.transactionId || '';
                refund.metadata = createRefundResult.metadata || {};
            }
            refund = await this.connection.getRepository(ctx, refund_entity_1.Refund).save(refund);
            if (createRefundResult) {
                const fromState = refund.state;
                try {
                    await this.refundStateMachine.transition(ctx, order, refund, createRefundResult.state);
                }
                catch (e) {
                    return new generated_graphql_admin_errors_1.RefundStateTransitionError(e.message, fromState, createRefundResult.state);
                }
                await this.connection.getRepository(ctx, refund_entity_1.Refund).save(refund, { reload: false });
                this.eventBus.publish(new refund_state_transition_event_1.RefundStateTransitionEvent(fromState, createRefundResult.state, ctx, refund, order));
            }
            if (primaryRefund == null) {
                primaryRefund = refund;
            }
            existingNonFailedRefunds.push(refund);
            refundedPaymentIds.push(paymentToRefund.id);
            refundOutstanding = refundTotal - shared_utils_1.summate(existingNonFailedRefunds, 'total');
        } while (0 < refundOutstanding);
        // tslint:disable-next-line:no-non-null-assertion
        return primaryRefund;
    }
    mergePaymentMetadata(m1, m2) {
        if (!m2) {
            return m1;
        }
        const merged = Object.assign(Object.assign({}, m1), m2);
        if (m1.public && m1.public) {
            merged.public = Object.assign(Object.assign({}, m1.public), m2.public);
        }
        return merged;
    }
};
PaymentService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        payment_state_machine_1.PaymentStateMachine,
        refund_state_machine_1.RefundStateMachine,
        payment_method_service_1.PaymentMethodService,
        event_bus_1.EventBus])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map