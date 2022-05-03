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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const unique_1 = require("@vendure/common/lib/unique");
const FindOptionsUtils_1 = require("typeorm/find-options/FindOptionsUtils");
const request_context_cache_service_1 = require("../../cache/request-context-cache.service");
const error_result_1 = require("../../common/error/error-result");
const errors_1 = require("../../common/error/errors");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const generated_graphql_shop_errors_1 = require("../../common/error/generated-graphql-shop-errors");
const tax_utils_1 = require("../../common/tax-utils");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const transactional_connection_1 = require("../../connection/transactional-connection");
const order_item_entity_1 = require("../../entity/order-item/order-item.entity");
const order_line_entity_1 = require("../../entity/order-line/order-line.entity");
const order_modification_entity_1 = require("../../entity/order-modification/order-modification.entity");
const order_entity_1 = require("../../entity/order/order.entity");
const payment_entity_1 = require("../../entity/payment/payment.entity");
const product_variant_entity_1 = require("../../entity/product-variant/product-variant.entity");
const refund_entity_1 = require("../../entity/refund/refund.entity");
const shipping_line_entity_1 = require("../../entity/shipping-line/shipping-line.entity");
const surcharge_entity_1 = require("../../entity/surcharge/surcharge.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const coupon_code_event_1 = require("../../event-bus/events/coupon-code-event");
const order_state_transition_event_1 = require("../../event-bus/events/order-state-transition-event");
const refund_state_transition_event_1 = require("../../event-bus/events/refund-state-transition-event");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const order_calculator_1 = require("../helpers/order-calculator/order-calculator");
const order_merger_1 = require("../helpers/order-merger/order-merger");
const order_modifier_1 = require("../helpers/order-modifier/order-modifier");
const order_state_machine_1 = require("../helpers/order-state-machine/order-state-machine");
const payment_state_machine_1 = require("../helpers/payment-state-machine/payment-state-machine");
const refund_state_machine_1 = require("../helpers/refund-state-machine/refund-state-machine");
const shipping_calculator_1 = require("../helpers/shipping-calculator/shipping-calculator");
const order_utils_1 = require("../helpers/utils/order-utils");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const channel_service_1 = require("./channel.service");
const country_service_1 = require("./country.service");
const customer_service_1 = require("./customer.service");
const fulfillment_service_1 = require("./fulfillment.service");
const history_service_1 = require("./history.service");
const payment_method_service_1 = require("./payment-method.service");
const payment_service_1 = require("./payment.service");
const product_variant_service_1 = require("./product-variant.service");
const promotion_service_1 = require("./promotion.service");
const stock_movement_service_1 = require("./stock-movement.service");
/**
 * @description
 * Contains methods relating to {@link Order} entities.
 *
 * @docsCategory services
 */
let OrderService = class OrderService {
    constructor(connection, configService, productVariantService, customerService, countryService, orderCalculator, shippingCalculator, orderStateMachine, orderMerger, paymentService, paymentStateMachine, paymentMethodService, fulfillmentService, listQueryBuilder, stockMovementService, refundStateMachine, historyService, promotionService, eventBus, channelService, orderModifier, customFieldRelationService, requestCache) {
        this.connection = connection;
        this.configService = configService;
        this.productVariantService = productVariantService;
        this.customerService = customerService;
        this.countryService = countryService;
        this.orderCalculator = orderCalculator;
        this.shippingCalculator = shippingCalculator;
        this.orderStateMachine = orderStateMachine;
        this.orderMerger = orderMerger;
        this.paymentService = paymentService;
        this.paymentStateMachine = paymentStateMachine;
        this.paymentMethodService = paymentMethodService;
        this.fulfillmentService = fulfillmentService;
        this.listQueryBuilder = listQueryBuilder;
        this.stockMovementService = stockMovementService;
        this.refundStateMachine = refundStateMachine;
        this.historyService = historyService;
        this.promotionService = promotionService;
        this.eventBus = eventBus;
        this.channelService = channelService;
        this.orderModifier = orderModifier;
        this.customFieldRelationService = customFieldRelationService;
        this.requestCache = requestCache;
    }
    /**
     * @description
     * Returns an array of all the configured states and transitions of the order process. This is
     * based on the default order process plus all configured {@link CustomOrderProcess} objects
     * defined in the {@link OrderOptions} `process` array.
     */
    getOrderProcessStates() {
        return Object.entries(this.orderStateMachine.config.transitions).map(([name, { to }]) => ({
            name,
            to,
        }));
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(order_entity_1.Order, options, {
            ctx,
            relations: [
                'lines',
                'customer',
                'lines.productVariant',
                'lines.items',
                'channels',
                'shippingLines',
            ],
            channelId: ctx.channelId,
            customPropertyMap: {
                customerLastName: 'customer.lastName',
            },
        })
            .getManyAndCount()
            .then(([items, totalItems]) => {
            return {
                items,
                totalItems,
            };
        });
    }
    async findOne(ctx, orderId) {
        const qb = this.connection
            .getRepository(ctx, order_entity_1.Order)
            .createQueryBuilder('order')
            .leftJoin('order.channels', 'channel')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.shippingLines', 'shippingLines')
            .leftJoinAndSelect('order.surcharges', 'surcharges')
            .leftJoinAndSelect('customer.user', 'user')
            .leftJoinAndSelect('order.lines', 'lines')
            .leftJoinAndSelect('lines.productVariant', 'productVariant')
            .leftJoinAndSelect('productVariant.taxCategory', 'prodVariantTaxCategory')
            .leftJoinAndSelect('productVariant.productVariantPrices', 'prices')
            .leftJoinAndSelect('productVariant.translations', 'translations')
            .leftJoinAndSelect('lines.featuredAsset', 'featuredAsset')
            .leftJoinAndSelect('lines.items', 'items')
            .leftJoinAndSelect('items.fulfillments', 'fulfillments')
            .leftJoinAndSelect('lines.taxCategory', 'lineTaxCategory')
            .where('order.id = :orderId', { orderId })
            .andWhere('channel.id = :channelId', { channelId: ctx.channelId })
            .addOrderBy('lines.createdAt', 'ASC')
            .addOrderBy('items.createdAt', 'ASC');
        // tslint:disable-next-line:no-non-null-assertion
        FindOptionsUtils_1.FindOptionsUtils.joinEagerRelations(qb, qb.alias, qb.expressionMap.mainAlias.metadata);
        const order = await qb.getOne();
        if (order) {
            for (const line of order.lines) {
                line.productVariant = translate_entity_1.translateDeep(await this.productVariantService.applyChannelPriceAndTax(line.productVariant, ctx, order), ctx.languageCode);
            }
            return order;
        }
    }
    async findOneByCode(ctx, orderCode) {
        const order = await this.connection.getRepository(ctx, order_entity_1.Order).findOne({
            relations: ['customer'],
            where: {
                code: orderCode,
            },
        });
        return order ? this.findOne(ctx, order.id) : undefined;
    }
    async findByCustomerId(ctx, customerId, options) {
        return this.listQueryBuilder
            .build(order_entity_1.Order, options, {
            relations: [
                'lines',
                'lines.items',
                'lines.productVariant',
                'lines.productVariant.options',
                'customer',
                'channels',
                'shippingLines',
            ],
            channelId: ctx.channelId,
            ctx,
        })
            .andWhere('order.customer.id = :customerId', { customerId })
            .getManyAndCount()
            .then(([items, totalItems]) => {
            items.forEach(item => {
                item.lines.forEach(line => {
                    line.productVariant = translate_entity_1.translateDeep(line.productVariant, ctx.languageCode, [
                        'options',
                    ]);
                });
            });
            return {
                items,
                totalItems,
            };
        });
    }
    /**
     * @description
     * Returns all {@link Payment} entities associated with the Order.
     */
    getOrderPayments(ctx, orderId) {
        return this.connection.getRepository(ctx, payment_entity_1.Payment).find({
            relations: ['refunds'],
            where: {
                order: { id: orderId },
            },
        });
    }
    /**
     * @description
     * Returns all OrderItems associated with the given {@link Refund}.
     */
    async getRefundOrderItems(ctx, refundId) {
        const refund = await this.connection.getEntityOrThrow(ctx, refund_entity_1.Refund, refundId, {
            relations: ['orderItems'],
        });
        return refund.orderItems;
    }
    /**
     * @description
     * Returns an array of any {@link OrderModification} entities associated with the Order.
     */
    getOrderModifications(ctx, orderId) {
        return this.connection.getRepository(ctx, order_modification_entity_1.OrderModification).find({
            where: {
                order: orderId,
            },
            relations: ['orderItems', 'payment', 'refund', 'surcharges'],
        });
    }
    /**
     * @description
     * Returns any {@link Refund}s associated with a {@link Payment}.
     */
    getPaymentRefunds(ctx, paymentId) {
        return this.connection.getRepository(ctx, refund_entity_1.Refund).find({
            where: {
                paymentId,
            },
        });
    }
    /**
     * @description
     * Returns any Order associated with the specified User's Customer account
     * that is still in the `active` state.
     */
    async getActiveOrderForUser(ctx, userId) {
        const customer = await this.customerService.findOneByUserId(ctx, userId);
        if (customer) {
            const activeOrder = await this.connection
                .getRepository(ctx, order_entity_1.Order)
                .createQueryBuilder('order')
                .innerJoinAndSelect('order.channels', 'channel', 'channel.id = :channelId', {
                channelId: ctx.channelId,
            })
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.shippingLines', 'shippingLines')
                .where('order.active = :active', { active: true })
                .andWhere('order.customer.id = :customerId', { customerId: customer.id })
                .orderBy('order.createdAt', 'DESC')
                .getOne();
            if (activeOrder) {
                return this.findOne(ctx, activeOrder.id);
            }
        }
    }
    /**
     * @description
     * Creates a new, empty Order. If a `userId` is passed, the Order will get associated with that
     * User's Customer account.
     */
    async create(ctx, userId) {
        const newOrder = new order_entity_1.Order({
            code: await this.configService.orderOptions.orderCodeStrategy.generate(ctx),
            state: this.orderStateMachine.getInitialState(),
            lines: [],
            surcharges: [],
            couponCodes: [],
            modifications: [],
            shippingAddress: {},
            billingAddress: {},
            subTotal: 0,
            subTotalWithTax: 0,
            currencyCode: ctx.channel.currencyCode,
        });
        if (userId) {
            const customer = await this.customerService.findOneByUserId(ctx, userId);
            if (customer) {
                newOrder.customer = customer;
            }
        }
        await this.channelService.assignToCurrentChannel(newOrder, ctx);
        const order = await this.connection.getRepository(ctx, order_entity_1.Order).save(newOrder);
        const transitionResult = await this.transitionToState(ctx, order.id, 'AddingItems');
        if (error_result_1.isGraphQlErrorResult(transitionResult)) {
            // this should never occur, so we will throw rather than return
            throw transitionResult;
        }
        return transitionResult;
    }
    /**
     * @description
     * Updates the custom fields of an Order.
     */
    async updateCustomFields(ctx, orderId, customFields) {
        let order = await this.getOrderOrThrow(ctx, orderId);
        order = patch_entity_1.patchEntity(order, { customFields });
        await this.customFieldRelationService.updateRelations(ctx, order_entity_1.Order, { customFields }, order);
        return this.connection.getRepository(ctx, order_entity_1.Order).save(order);
    }
    /**
     * @description
     * Adds an OrderItem to the Order, either creating a new OrderLine or
     * incrementing an existing one.
     */
    async addItemToOrder(ctx, orderId, productVariantId, quantity, customFields) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const existingOrderLine = await this.orderModifier.getExistingOrderLine(ctx, order, productVariantId, customFields);
        const validationError = this.assertQuantityIsPositive(quantity) ||
            this.assertAddingItemsState(order) ||
            this.assertNotOverOrderItemsLimit(order, quantity) ||
            this.assertNotOverOrderLineItemsLimit(existingOrderLine, quantity);
        if (validationError) {
            return validationError;
        }

        const existingQuantity = existingOrderLine === null || existingOrderLine === void 0 ? 0 : existingOrderLine.quantity;
        const correctedQuantity = existingQuantity + quantity

        const orderLine = await this.orderModifier.getOrCreateOrderLine(ctx, order, productVariantId, customFields);
        if (correctedQuantity < quantity) {
            const newQuantity = (existingOrderLine ? existingOrderLine === null || existingOrderLine === void 0 ? void 0 : existingOrderLine.quantity : 0) + correctedQuantity;
            await this.orderModifier.updateOrderLineQuantity(ctx, orderLine, newQuantity, order);
        }
        else {
            await this.orderModifier.updateOrderLineQuantity(ctx, orderLine, correctedQuantity, order);
        }
        const quantityWasAdjustedDown = correctedQuantity < quantity;
        const updatedOrder = await this.applyPriceAdjustments(ctx, order, [orderLine]);
        if (quantityWasAdjustedDown) {
            return new generated_graphql_shop_errors_1.InsufficientStockError(correctedQuantity, updatedOrder);
        }
        else {
            return updatedOrder;
        }
    }
    /**
     * @description
     * Adjusts the quantity and/or custom field values of an existing OrderLine.
     */
    async adjustOrderLine(ctx, orderId, orderLineId, quantity, customFields) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const orderLine = this.getOrderLineOrThrow(order, orderLineId);
        const validationError = this.assertAddingItemsState(order) ||
            this.assertQuantityIsPositive(quantity) ||
            this.assertNotOverOrderItemsLimit(order, quantity - orderLine.quantity) ||
            this.assertNotOverOrderLineItemsLimit(orderLine, quantity - orderLine.quantity);
        if (validationError) {
            return validationError;
        }
        if (customFields != null) {
            orderLine.customFields = customFields;
            await this.customFieldRelationService.updateRelations(ctx, order_line_entity_1.OrderLine, { customFields }, orderLine);
        }
        const correctedQuantity = await this.orderModifier.constrainQuantityToSaleable(ctx, orderLine.productVariant, quantity);
        let updatedOrderLines = [orderLine];
        if (correctedQuantity === 0) {
            order.lines = order.lines.filter(l => !utils_1.idsAreEqual(l.id, orderLine.id));
            await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).remove(orderLine);
            updatedOrderLines = [];
        }
        else {
            await this.orderModifier.updateOrderLineQuantity(ctx, orderLine, correctedQuantity, order);
        }
        const quantityWasAdjustedDown = correctedQuantity < quantity;
        const updatedOrder = await this.applyPriceAdjustments(ctx, order, updatedOrderLines);
        if (quantityWasAdjustedDown) {
            return new generated_graphql_shop_errors_1.InsufficientStockError(correctedQuantity, updatedOrder);
        }
        else {
            return updatedOrder;
        }
    }
    /**
     * @description
     * Removes the specified OrderLine from the Order.
     */
    async removeItemFromOrder(ctx, orderId, orderLineId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const validationError = this.assertAddingItemsState(order);
        if (validationError) {
            return validationError;
        }
        const orderLine = this.getOrderLineOrThrow(order, orderLineId);
        order.lines = order.lines.filter(line => !utils_1.idsAreEqual(line.id, orderLineId));
        const updatedOrder = await this.applyPriceAdjustments(ctx, order);
        await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).remove(orderLine);
        return updatedOrder;
    }
    /**
     * @description
     * Removes all OrderLines from the Order.
     */
    async removeAllItemsFromOrder(ctx, orderId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const validationError = this.assertAddingItemsState(order);
        if (validationError) {
            return validationError;
        }
        await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).remove(order.lines);
        order.lines = [];
        const updatedOrder = await this.applyPriceAdjustments(ctx, order);
        return updatedOrder;
    }
    /**
     * @description
     * Adds a {@link Surcharge} to the Order.
     */
    async addSurchargeToOrder(ctx, orderId, surchargeInput) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const surcharge = await this.connection.getRepository(ctx, surcharge_entity_1.Surcharge).save(new surcharge_entity_1.Surcharge(Object.assign({ taxLines: [], sku: '', listPriceIncludesTax: ctx.channel.pricesIncludeTax, order }, surchargeInput)));
        order.surcharges.push(surcharge);
        const updatedOrder = await this.applyPriceAdjustments(ctx, order);
        return updatedOrder;
    }
    /**
     * @description
     * Removes a {@link Surcharge} from the Order.
     */
    async removeSurchargeFromOrder(ctx, orderId, surchargeId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const surcharge = await this.connection.getEntityOrThrow(ctx, surcharge_entity_1.Surcharge, surchargeId);
        if (order.surcharges.find(s => utils_1.idsAreEqual(s.id, surcharge.id))) {
            order.surcharges = order.surcharges.filter(s => !utils_1.idsAreEqual(s.id, surchargeId));
            const updatedOrder = await this.applyPriceAdjustments(ctx, order);
            await this.connection.getRepository(ctx, surcharge_entity_1.Surcharge).remove(surcharge);
            return updatedOrder;
        }
        else {
            return order;
        }
    }
    /**
     * @description
     * Applies a coupon code to the Order, which should be a valid coupon code as specified in the configuration
     * of an active {@link Promotion}.
     */
    async applyCouponCode(ctx, orderId, couponCode) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        if (order.couponCodes.includes(couponCode)) {
            return order;
        }
        const validationResult = await this.promotionService.validateCouponCode(ctx, couponCode, order.customer && order.customer.id);
        if (error_result_1.isGraphQlErrorResult(validationResult)) {
            return validationResult;
        }
        order.couponCodes.push(couponCode);
        await this.historyService.createHistoryEntryForOrder({
            ctx,
            orderId: order.id,
            type: generated_types_1.HistoryEntryType.ORDER_COUPON_APPLIED,
            data: { couponCode, promotionId: validationResult.id },
        });
        this.eventBus.publish(new coupon_code_event_1.CouponCodeEvent(ctx, couponCode, orderId, 'assigned'));
        return this.applyPriceAdjustments(ctx, order);
    }
    /**
     * @description
     * Removes a coupon code from the Order.
     */
    async removeCouponCode(ctx, orderId, couponCode) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        if (order.couponCodes.includes(couponCode)) {
            // When removing a couponCode which has triggered an Order-level discount
            // we need to make sure we persist the changes to the adjustments array of
            // any affected OrderItems.
            const affectedOrderItems = order.lines
                .reduce((items, l) => [...items, ...l.items], [])
                .filter(i => i.adjustments.filter(a => a.type === generated_types_1.AdjustmentType.DISTRIBUTED_ORDER_PROMOTION)
                .length);
            order.couponCodes = order.couponCodes.filter(cc => cc !== couponCode);
            await this.historyService.createHistoryEntryForOrder({
                ctx,
                orderId: order.id,
                type: generated_types_1.HistoryEntryType.ORDER_COUPON_REMOVED,
                data: { couponCode },
            });
            this.eventBus.publish(new coupon_code_event_1.CouponCodeEvent(ctx, couponCode, orderId, 'removed'));
            const result = await this.applyPriceAdjustments(ctx, order);
            await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).save(affectedOrderItems);
            return result;
        }
        else {
            return order;
        }
    }
    /**
     * @description
     * Returns all {@link Promotion}s associated with an Order. A Promotion only gets associated with
     * and Order once the order has been placed (see {@link OrderPlacedStrategy}).
     */
    async getOrderPromotions(ctx, orderId) {
        const order = await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, orderId, {
            channelId: ctx.channelId,
            relations: ['promotions'],
        });
        return order.promotions || [];
    }
    /**
     * @description
     * Returns the next possible states that the Order may transition to.
     */
    getNextOrderStates(order) {
        return this.orderStateMachine.getNextStates(order);
    }
    /**
     * @description
     * Sets the shipping address for the Order.
     */
    async setShippingAddress(ctx, orderId, input) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const country = await this.countryService.findOneByCode(ctx, input.countryCode);
        order.shippingAddress = Object.assign(Object.assign({}, input), { countryCode: input.countryCode, country: country.name });
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order);
        // Since a changed ShippingAddress could alter the activeTaxZone,
        // we will remove any cached activeTaxZone so it can be re-calculated
        // as needed.
        this.requestCache.set(ctx, 'activeTaxZone', undefined);
        return this.applyPriceAdjustments(ctx, order, order.lines);
    }
    /**
     * @description
     * Sets the billing address for the Order.
     */
    async setBillingAddress(ctx, orderId, input) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const country = await this.countryService.findOneByCode(ctx, input.countryCode);
        order.billingAddress = Object.assign(Object.assign({}, input), { countryCode: input.countryCode, country: country.name });
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order);
        // Since a changed ShippingAddress could alter the activeTaxZone,
        // we will remove any cached activeTaxZone so it can be re-calculated
        // as needed.
        this.requestCache.set(ctx, 'activeTaxZone', undefined);
        return this.applyPriceAdjustments(ctx, order, order.lines);
    }
    /**
     * @description
     * Returns an array of quotes stating which {@link ShippingMethod}s may be applied to this Order.
     * This is determined by the configured {@link ShippingEligibilityChecker} of each ShippingMethod.
     *
     * The quote also includes a price for each method, as determined by the configured
     * {@link ShippingCalculator} of each eligible ShippingMethod.
     */
    async getEligibleShippingMethods(ctx, orderId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const eligibleMethods = await this.shippingCalculator.getEligibleShippingMethods(ctx, order);
        return eligibleMethods.map(eligible => {
            const { price, taxRate, priceIncludesTax, metadata } = eligible.result;
            return {
                id: eligible.method.id,
                price: priceIncludesTax ? tax_utils_1.netPriceOf(price, taxRate) : price,
                priceWithTax: priceIncludesTax ? price : tax_utils_1.grossPriceOf(price, taxRate),
                description: eligible.method.description,
                name: eligible.method.name,
                code: eligible.method.code,
                metadata,
                customFields: eligible.method.customFields,
            };
        });
    }
    /**
     * @description
     * Returns an array of quotes stating which {@link PaymentMethod}s may be used on this Order.
     */
    async getEligiblePaymentMethods(ctx, orderId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        return this.paymentMethodService.getEligiblePaymentMethods(ctx, order);
    }
    /**
     * @description
     * Sets the ShippingMethod to be used on this Order.
     */
    async setShippingMethod(ctx, orderId, shippingMethodId) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        const validationError = this.assertAddingItemsState(order);
        if (validationError) {
            return validationError;
        }
        const shippingMethod = await this.shippingCalculator.getMethodIfEligible(ctx, order, shippingMethodId);
        if (!shippingMethod) {
            return new generated_graphql_shop_errors_1.IneligibleShippingMethodError();
        }
        let shippingLine = order.shippingLines[0];
        if (shippingLine) {
            shippingLine.shippingMethod = shippingMethod;
        }
        else {
            shippingLine = await this.connection.getRepository(ctx, shipping_line_entity_1.ShippingLine).save(new shipping_line_entity_1.ShippingLine({
                shippingMethod,
                order,
                adjustments: [],
                listPrice: 0,
                listPriceIncludesTax: ctx.channel.pricesIncludeTax,
                taxLines: [],
            }));
            order.shippingLines = [shippingLine];
        }
        await this.connection.getRepository(ctx, shipping_line_entity_1.ShippingLine).save(shippingLine);
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        await this.applyPriceAdjustments(ctx, order);
        return this.connection.getRepository(ctx, order_entity_1.Order).save(order);
    }
    /**
     * @description
     * Transitions the Order to the given state.
     */
    async transitionToState(ctx, orderId, state) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        order.payments = await this.getOrderPayments(ctx, orderId);
        const fromState = order.state;
        try {
            await this.orderStateMachine.transition(ctx, order, state);
        }
        catch (e) {
            const transitionError = ctx.translate(e.message, { fromState, toState: state });
            return new generated_graphql_shop_errors_1.OrderStateTransitionError(transitionError, fromState, state);
        }
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        this.eventBus.publish(new order_state_transition_event_1.OrderStateTransitionEvent(fromState, state, ctx, order));
        return order;
    }
    /**
     * @description
     * Transitions a Fulfillment to the given state and then transitions the Order state based on
     * whether all Fulfillments of the Order are shipped or delivered.
     */
    async transitionFulfillmentToState(ctx, fulfillmentId, state) {
        const result = await this.fulfillmentService.transitionToState(ctx, fulfillmentId, state);
        if (error_result_1.isGraphQlErrorResult(result)) {
            return result;
        }
        const { fulfillment, fromState, toState, orders } = result;
        if (toState === 'Cancelled') {
            await this.stockMovementService.createCancellationsForOrderItems(ctx, fulfillment.orderItems);
            const lines = await this.groupOrderItemsIntoLines(ctx, fulfillment.orderItems);
            await this.stockMovementService.createAllocationsForOrderLines(ctx, lines);
        }
        await Promise.all(orders.map(order => this.handleFulfillmentStateTransitByOrder(ctx, order, fromState, toState)));
        return fulfillment;
    }
    /**
     * @description
     * Allows the Order to be modified, which allows several aspects of the Order to be changed:
     *
     * * Changes to OrderLine quantities
     * * New OrderLines being added
     * * Arbitrary {@link Surcharge}s being added
     * * Shipping or billing address changes
     *
     * Setting the `dryRun` input property to `true` will apply all changes, including updating the price of the
     * Order, but will not actually persist any of those changes to the database.
     */
    async modifyOrder(ctx, input) {
        await this.connection.startTransaction(ctx);
        const order = await this.getOrderOrThrow(ctx, input.orderId);
        const result = await this.orderModifier.modifyOrder(ctx, input, order);
        if (input.dryRun) {
            await this.connection.rollBackTransaction(ctx);
            return error_result_1.isGraphQlErrorResult(result) ? result : result.order;
        }
        if (error_result_1.isGraphQlErrorResult(result)) {
            await this.connection.rollBackTransaction(ctx);
            return result;
        }
        await this.historyService.createHistoryEntryForOrder({
            ctx,
            orderId: input.orderId,
            type: generated_types_1.HistoryEntryType.ORDER_MODIFIED,
            data: {
                modificationId: result.modification.id,
            },
        });
        await this.connection.commitOpenTransaction(ctx);
        return this.getOrderOrThrow(ctx, input.orderId);
    }
    async handleFulfillmentStateTransitByOrder(ctx, order, fromState, toState) {
        const nextOrderStates = this.getNextOrderStates(order);
        const transitionOrderIfStateAvailable = (state) => nextOrderStates.includes(state) && this.transitionToState(ctx, order.id, state);
        if (toState === 'Shipped') {
            const orderWithFulfillment = await this.getOrderWithFulfillments(ctx, order.id);
            if (order_utils_1.orderItemsAreShipped(orderWithFulfillment)) {
                await transitionOrderIfStateAvailable('Shipped');
            }
            else {
                await transitionOrderIfStateAvailable('PartiallyShipped');
            }
        }
        if (toState === 'Delivered') {
            const orderWithFulfillment = await this.getOrderWithFulfillments(ctx, order.id);
            if (order_utils_1.orderItemsAreDelivered(orderWithFulfillment)) {
                await transitionOrderIfStateAvailable('Delivered');
            }
            else {
                await transitionOrderIfStateAvailable('PartiallyDelivered');
            }
        }
    }
    /**
     * @description
     * Transitions the given {@link Payment} to a new state. If the order totalWithTax price is then
     * covered by Payments, the Order state will be automatically transitioned to `PaymentSettled`
     * or `PaymentAuthorized`.
     */
    async transitionPaymentToState(ctx, paymentId, state) {
        const result = await this.paymentService.transitionToState(ctx, paymentId, state);
        if (error_result_1.isGraphQlErrorResult(result)) {
            return result;
        }
        const order = await this.findOne(ctx, result.order.id);
        if (order) {
            order.payments = await this.getOrderPayments(ctx, order.id);
            await this.transitionOrderIfTotalIsCovered(ctx, order);
        }
        return result;
    }
    /**
     * @description
     * Adds a new Payment to the Order. If the Order totalWithTax is covered by Payments, then the Order
     * state will get automatically transitioned to the `PaymentSettled` or `PaymentAuthorized` state.
     */
    async addPaymentToOrder(ctx, orderId, input) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        if (order.state !== 'ArrangingPayment') {
            return new generated_graphql_shop_errors_1.OrderPaymentStateError();
        }
        order.payments = await this.getOrderPayments(ctx, order.id);
        const amountToPay = order.totalWithTax - order_utils_1.totalCoveredByPayments(order);
        const payment = await this.paymentService.createPayment(ctx, order, amountToPay, input.method, input.metadata);
        if (error_result_1.isGraphQlErrorResult(payment)) {
            return payment;
        }
        const existingPayments = await this.getOrderPayments(ctx, orderId);
        order.payments = [...existingPayments, payment];
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        if (payment.state === 'Error') {
            return new generated_graphql_shop_errors_1.PaymentFailedError(payment.errorMessage || '');
        }
        if (payment.state === 'Declined') {
            return new generated_graphql_shop_errors_1.PaymentDeclinedError(payment.errorMessage || '');
        }
        return this.transitionOrderIfTotalIsCovered(ctx, order);
    }
    async transitionOrderIfTotalIsCovered(ctx, order) {
        const orderId = order.id;
        if (order_utils_1.orderTotalIsCovered(order, 'Settled') && order.state !== 'PaymentSettled') {
            return this.transitionToState(ctx, orderId, 'PaymentSettled');
        }
        if (order_utils_1.orderTotalIsCovered(order, ['Authorized', 'Settled']) && order.state !== 'PaymentAuthorized') {
            return this.transitionToState(ctx, orderId, 'PaymentAuthorized');
        }
        return order;
    }
    /**
     * @description
     * This method is used after modifying an existing completed order using the `modifyOrder()` method. If the modifications
     * cause the order total to increase (such as when adding a new OrderLine), then there will be an outstanding charge to
     * pay.
     *
     * This method allows you to add a new Payment and assumes the actual processing has been done manually, e.g. in the
     * dashboard of your payment provider.
     */
    async addManualPaymentToOrder(ctx, input) {
        const order = await this.getOrderOrThrow(ctx, input.orderId);
        if (order.state !== 'ArrangingAdditionalPayment' && order.state !== 'ArrangingPayment') {
            return new generated_graphql_admin_errors_1.ManualPaymentStateError();
        }
        const existingPayments = await this.getOrderPayments(ctx, order.id);
        order.payments = existingPayments;
        const amount = order.totalWithTax - order_utils_1.totalCoveredByPayments(order);
        const modifications = await this.getOrderModifications(ctx, order.id);
        const unsettledModifications = modifications.filter(m => !m.isSettled);
        if (0 < unsettledModifications.length) {
            const outstandingModificationsTotal = shared_utils_1.summate(unsettledModifications, 'priceChange');
            if (outstandingModificationsTotal !== amount) {
                throw new errors_1.InternalServerError(`The outstanding order amount (${amount}) should equal the unsettled OrderModifications total (${outstandingModificationsTotal})`);
            }
        }
        const payment = await this.paymentService.createManualPayment(ctx, order, amount, input);
        order.payments.push(payment);
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        for (const modification of unsettledModifications) {
            modification.payment = payment;
            await this.connection.getRepository(ctx, order_modification_entity_1.OrderModification).save(modification);
        }
        return order;
    }
    /**
     * @description
     * Settles a payment by invoking the {@link PaymentMethodHandler}'s `settlePayment()` method. Automatically
     * transitions the Order state if all Payments are settled.
     */
    async settlePayment(ctx, paymentId) {
        const payment = await this.paymentService.settlePayment(ctx, paymentId);
        if (!error_result_1.isGraphQlErrorResult(payment)) {
            if (payment.state !== 'Settled') {
                return new generated_graphql_admin_errors_1.SettlePaymentError(payment.errorMessage || '');
            }
            const order = await this.findOne(ctx, payment.order.id);
            if (order) {
                order.payments = await this.getOrderPayments(ctx, order.id);
                const orderTransitionResult = await this.transitionOrderIfTotalIsCovered(ctx, order);
                if (error_result_1.isGraphQlErrorResult(orderTransitionResult)) {
                    return orderTransitionResult;
                }
            }
        }
        return payment;
    }
    /**
     * @description
     * Creates a new Fulfillment associated with the given Order and OrderItems.
     */
    async createFulfillment(ctx, input) {
        if (!input.lines || input.lines.length === 0 || shared_utils_1.summate(input.lines, 'quantity') === 0) {
            return new generated_graphql_admin_errors_1.EmptyOrderLineSelectionError();
        }
        const ordersAndItems = await this.getOrdersAndItemsFromLines(ctx, input.lines, i => !i.fulfillment && !i.cancelled);
        if (!ordersAndItems) {
            return new generated_graphql_admin_errors_1.ItemsAlreadyFulfilledError();
        }
        const stockCheckResult = await this.ensureSufficientStockForFulfillment(ctx, input);
        if (error_result_1.isGraphQlErrorResult(stockCheckResult)) {
            return stockCheckResult;
        }
        const fulfillment = await this.fulfillmentService.create(ctx, ordersAndItems.orders, ordersAndItems.items, input.handler);
        if (error_result_1.isGraphQlErrorResult(fulfillment)) {
            return fulfillment;
        }
        await this.stockMovementService.createSalesForOrder(ctx, ordersAndItems.items);
        for (const order of ordersAndItems.orders) {
            await this.historyService.createHistoryEntryForOrder({
                ctx,
                orderId: order.id,
                type: generated_types_1.HistoryEntryType.ORDER_FULFILLMENT,
                data: {
                    fulfillmentId: fulfillment.id,
                },
            });
        }
        const result = await this.fulfillmentService.transitionToState(ctx, fulfillment.id, 'Pending');
        if (error_result_1.isGraphQlErrorResult(result)) {
            return result;
        }
        return result.fulfillment;
    }
    async ensureSufficientStockForFulfillment(ctx, input) {
        const lines = await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).findByIds(input.lines.map(l => l.orderLineId), { relations: ['productVariant'] });
        for (const line of lines) {
            // tslint:disable-next-line:no-non-null-assertion
            const lineInput = input.lines.find(l => utils_1.idsAreEqual(l.orderLineId, line.id));
            const fulfillableStockLevel = await this.productVariantService.getFulfillableStockLevel(ctx, line.productVariant);
            if (fulfillableStockLevel < lineInput.quantity) {
                const productVariant = translate_entity_1.translateDeep(line.productVariant, ctx.languageCode);
                return new generated_graphql_admin_errors_1.InsufficientStockOnHandError(productVariant.id, productVariant.name, productVariant.stockOnHand);
            }
        }
    }
    /**
     * @description
     * Returns an array of all Fulfillments associated with the Order.
     */
    async getOrderFulfillments(ctx, order) {
        var _a, _b, _c, _d;
        let lines;
        if (((_d = (_c = (_b = (_a = order.lines) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.items) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.fulfillments) !== undefined) {
            lines = order.lines;
        }
        else {
            lines = await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).find({
                where: {
                    order: order.id,
                },
                relations: ['items', 'items.fulfillments'],
            });
        }
        const items = lines.reduce((acc, l) => [...acc, ...l.items], []);
        const fulfillments = items.reduce((acc, i) => [...acc, ...(i.fulfillments || [])], []);
        return unique_1.unique(fulfillments, 'id');
    }
    /**
     * @description
     * Returns an array of all Surcharges associated with the Order.
     */
    async getOrderSurcharges(ctx, orderId) {
        const order = await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, orderId, {
            channelId: ctx.channelId,
            relations: ['surcharges'],
        });
        return order.surcharges || [];
    }
    /**
     * @description
     * Cancels an Order by transitioning it to the `Cancelled` state. If stock is being tracked for the ProductVariants
     * in the Order, then new {@link StockMovement}s will be created to correct the stock levels.
     */
    async cancelOrder(ctx, input) {
        let allOrderItemsCancelled = false;
        const cancelResult = input.lines != null
            ? await this.cancelOrderByOrderLines(ctx, input, input.lines)
            : await this.cancelOrderById(ctx, input);
        if (error_result_1.isGraphQlErrorResult(cancelResult)) {
            return cancelResult;
        }
        else {
            allOrderItemsCancelled = cancelResult;
        }
        if (allOrderItemsCancelled) {
            const transitionResult = await this.transitionToState(ctx, input.orderId, 'Cancelled');
            if (error_result_1.isGraphQlErrorResult(transitionResult)) {
                return transitionResult;
            }
        }
        return utils_1.assertFound(this.findOne(ctx, input.orderId));
    }
    async cancelOrderById(ctx, input) {
        const order = await this.getOrderOrThrow(ctx, input.orderId);
        if (order.active) {
            return true;
        }
        else {
            const lines = order.lines.map(l => ({
                orderLineId: l.id,
                quantity: l.quantity,
            }));
            return this.cancelOrderByOrderLines(ctx, input, lines);
        }
    }
    async cancelOrderByOrderLines(ctx, input, lines) {
        if (lines.length === 0 || shared_utils_1.summate(lines, 'quantity') === 0) {
            return new generated_graphql_admin_errors_1.EmptyOrderLineSelectionError();
        }
        const ordersAndItems = await this.getOrdersAndItemsFromLines(ctx, lines, i => !i.cancelled);
        if (!ordersAndItems) {
            return new generated_graphql_admin_errors_1.QuantityTooGreatError();
        }
        if (1 < ordersAndItems.orders.length) {
            return new generated_graphql_admin_errors_1.MultipleOrderError();
        }
        const { orders, items } = ordersAndItems;
        const order = orders[0];
        if (!utils_1.idsAreEqual(order.id, input.orderId)) {
            return new generated_graphql_admin_errors_1.MultipleOrderError();
        }
        if (order.active) {
            return new generated_graphql_admin_errors_1.CancelActiveOrderError(order.state);
        }
        const fullOrder = await this.findOne(ctx, order.id);
        const soldItems = items.filter(i => !!i.fulfillment);
        const allocatedItems = items.filter(i => !i.fulfillment);
        await this.stockMovementService.createCancellationsForOrderItems(ctx, soldItems);
        await this.stockMovementService.createReleasesForOrderItems(ctx, allocatedItems);
        items.forEach(i => (i.cancelled = true));
        await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).save(items, { reload: false });
        const orderWithItems = await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, order.id, {
            relations: ['lines', 'lines.items'],
        });
        await this.historyService.createHistoryEntryForOrder({
            ctx,
            orderId: order.id,
            type: generated_types_1.HistoryEntryType.ORDER_CANCELLATION,
            data: {
                orderItemIds: items.map(i => i.id),
                reason: input.reason || undefined,
            },
        });
        return order_utils_1.orderItemsAreAllCancelled(orderWithItems);
    }
    /**
     * @description
     * Creates a {@link Refund} against the order and in doing so invokes the `createRefund()` method of the
     * {@link PaymentMethodHandler}.
     */
    async refundOrder(ctx, input) {
        if ((!input.lines || input.lines.length === 0 || shared_utils_1.summate(input.lines, 'quantity') === 0) &&
            input.shipping === 0) {
            return new generated_graphql_admin_errors_1.NothingToRefundError();
        }
        const ordersAndItems = await this.getOrdersAndItemsFromLines(ctx, input.lines, i => { var _a; return ((_a = i.refund) === null || _a === void 0 ? void 0 : _a.state) !== 'Settled'; });
        if (!ordersAndItems) {
            return new generated_graphql_admin_errors_1.QuantityTooGreatError();
        }
        const { orders, items } = ordersAndItems;
        if (1 < orders.length) {
            return new generated_graphql_admin_errors_1.MultipleOrderError();
        }
        const payment = await this.connection.getEntityOrThrow(ctx, payment_entity_1.Payment, input.paymentId, {
            relations: ['order'],
        });
        if (orders && orders.length && !utils_1.idsAreEqual(payment.order.id, orders[0].id)) {
            return new generated_graphql_admin_errors_1.PaymentOrderMismatchError();
        }
        const order = payment.order;
        if (order.state === 'AddingItems' ||
            order.state === 'ArrangingPayment' ||
            order.state === 'PaymentAuthorized') {
            return new generated_graphql_admin_errors_1.RefundOrderStateError(order.state);
        }
        const alreadyRefunded = items.find(i => { var _a, _b; return ((_a = i.refund) === null || _a === void 0 ? void 0 : _a.state) === 'Pending' || ((_b = i.refund) === null || _b === void 0 ? void 0 : _b.state) === 'Settled'; });
        if (alreadyRefunded) {
            return new generated_graphql_admin_errors_1.AlreadyRefundedError(alreadyRefunded.refundId);
        }
        return await this.paymentService.createRefund(ctx, input, order, items, payment);
    }
    /**
     * @description
     * Settles a Refund by transitioning it to the `Settled` state.
     */
    async settleRefund(ctx, input) {
        const refund = await this.connection.getEntityOrThrow(ctx, refund_entity_1.Refund, input.id, {
            relations: ['payment', 'payment.order'],
        });
        refund.transactionId = input.transactionId;
        const fromState = refund.state;
        const toState = 'Settled';
        await this.refundStateMachine.transition(ctx, refund.payment.order, refund, toState);
        await this.connection.getRepository(ctx, refund_entity_1.Refund).save(refund);
        this.eventBus.publish(new refund_state_transition_event_1.RefundStateTransitionEvent(fromState, toState, ctx, refund, refund.payment.order));
        return refund;
    }
    /**
     * @description
     * Associates a Customer with the Order.
     */
    async addCustomerToOrder(ctx, orderId, customer) {
        const order = await this.getOrderOrThrow(ctx, orderId);
        order.customer = customer;
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        // Check that any applied couponCodes are still valid now that
        // we know the Customer.
        if (order.couponCodes) {
            let codesRemoved = false;
            for (const couponCode of order.couponCodes.slice()) {
                const validationResult = await this.promotionService.validateCouponCode(ctx, couponCode, customer.id);
                if (error_result_1.isGraphQlErrorResult(validationResult)) {
                    order.couponCodes = order.couponCodes.filter(c => c !== couponCode);
                    codesRemoved = true;
                }
            }
            if (codesRemoved) {
                return this.applyPriceAdjustments(ctx, order);
            }
        }
        return order;
    }
    /**
     * @description
     * Creates a new "ORDER_NOTE" type {@link OrderHistoryEntry} in the Order's history timeline.
     */
    async addNoteToOrder(ctx, input) {
        const order = await this.getOrderOrThrow(ctx, input.id);
        await this.historyService.createHistoryEntryForOrder({
            ctx,
            orderId: order.id,
            type: generated_types_1.HistoryEntryType.ORDER_NOTE,
            data: {
                note: input.note,
            },
        }, input.isPublic);
        return order;
    }
    async updateOrderNote(ctx, input) {
        var _a;
        return this.historyService.updateOrderHistoryEntry(ctx, {
            type: generated_types_1.HistoryEntryType.ORDER_NOTE,
            data: input.note ? { note: input.note } : undefined,
            isPublic: (_a = input.isPublic) !== null && _a !== void 0 ? _a : undefined,
            ctx,
            entryId: input.noteId,
        });
    }
    async deleteOrderNote(ctx, id) {
        try {
            await this.historyService.deleteOrderHistoryEntry(ctx, id);
            return {
                result: generated_types_1.DeletionResult.DELETED,
            };
        }
        catch (e) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: e.message,
            };
        }
    }
    /**
     * @description
     * When a guest user with an anonymous Order signs in and has an existing Order associated with that Customer,
     * we need to reconcile the contents of the two orders.
     *
     * The logic used to do the merging is specified in the {@link OrderOptions} `mergeStrategy` config setting.
     */
    async mergeOrders(ctx, user, guestOrder, existingOrder) {
        if (guestOrder && guestOrder.customer) {
            // In this case the "guest order" is actually an order of an existing Customer,
            // so we do not want to merge at all. See https://github.com/vendure-ecommerce/vendure/issues/263
            return existingOrder;
        }
        const mergeResult = await this.orderMerger.merge(ctx, guestOrder, existingOrder);
        const { orderToDelete, linesToInsert, linesToDelete, linesToModify } = mergeResult;
        let { order } = mergeResult;
        if (orderToDelete) {
            // TODO: v2 - Will not be needed after adding `{ onDelete: 'CASCADE' }` constraint to ShippingLine.order
            for (const shippingLine of orderToDelete.shippingLines) {
                await this.connection.getRepository(ctx, shipping_line_entity_1.ShippingLine).delete(shippingLine.id);
            }
            await this.connection.getRepository(ctx, order_entity_1.Order).delete(orderToDelete.id);
        }
        if (order && linesToInsert) {
            const orderId = order.id;
            for (const line of linesToInsert) {
                const result = await this.addItemToOrder(ctx, orderId, line.productVariantId, line.quantity, line.customFields);
                if (!error_result_1.isGraphQlErrorResult(result)) {
                    order = result;
                }
            }
        }
        if (order && linesToModify) {
            const orderId = order.id;
            for (const line of linesToModify) {
                const result = await this.adjustOrderLine(ctx, orderId, line.orderLineId, line.quantity, line.customFields);
                if (!error_result_1.isGraphQlErrorResult(result)) {
                    order = result;
                }
            }
        }
        if (order && linesToDelete) {
            const orderId = order.id;
            for (const line of linesToDelete) {
                const result = await this.removeItemFromOrder(ctx, orderId, line.orderLineId);
                if (!error_result_1.isGraphQlErrorResult(result)) {
                    order = result;
                }
            }
        }
        const customer = await this.customerService.findOneByUserId(ctx, user.id);
        if (order && customer) {
            order.customer = customer;
            await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        }
        return order;
    }
    async getOrderOrThrow(ctx, orderId) {
        const order = await this.findOne(ctx, orderId);
        if (!order) {
            throw new errors_1.EntityNotFoundError('Order', orderId);
        }
        return order;
    }
    getOrderLineOrThrow(order, orderLineId) {
        const orderLine = order.lines.find(line => utils_1.idsAreEqual(line.id, orderLineId));
        if (!orderLine) {
            throw new errors_1.UserInputError(`error.order-does-not-contain-line-with-id`, { id: orderLineId });
        }
        return orderLine;
    }
    /**
     * Returns error if quantity is negative.
     */
    assertQuantityIsPositive(quantity) {
        if (quantity < 0) {
            return new generated_graphql_shop_errors_1.NegativeQuantityError();
        }
    }
    /**
     * Returns error if the Order is not in the "AddingItems" state.
     */
    assertAddingItemsState(order) {
        if (order.state !== 'AddingItems') {
            return new generated_graphql_shop_errors_1.OrderModificationError();
        }
    }
    /**
     * Throws if adding the given quantity would take the total order items over the
     * maximum limit specified in the config.
     */
    assertNotOverOrderItemsLimit(order, quantityToAdd) {
        const currentItemsCount = shared_utils_1.summate(order.lines, 'quantity');
        const { orderItemsLimit } = this.configService.orderOptions;
        if (orderItemsLimit < currentItemsCount + quantityToAdd) {
            return new generated_graphql_shop_errors_1.OrderLimitError(orderItemsLimit);
        }
    }
    /**
     * Throws if adding the given quantity would exceed the maximum allowed
     * quantity for one order line.
     */
    assertNotOverOrderLineItemsLimit(orderLine, quantityToAdd) {
        const currentQuantity = (orderLine === null || orderLine === void 0 ? void 0 : orderLine.quantity) || 0;
        const { orderLineItemsLimit } = this.configService.orderOptions;
        if (orderLineItemsLimit < currentQuantity + quantityToAdd) {
            return new generated_graphql_shop_errors_1.OrderLimitError(orderLineItemsLimit);
        }
    }
    /**
     * Applies promotions, taxes and shipping to the Order.
     */
    async applyPriceAdjustments(ctx, order, updatedOrderLines) {
        var _a, _b;
        if (updatedOrderLines === null || updatedOrderLines === void 0 ? void 0 : updatedOrderLines.length) {
            const { orderItemPriceCalculationStrategy, changedPriceHandlingStrategy } = this.configService.orderOptions;
            for (const updatedOrderLine of updatedOrderLines) {
                const variant = await this.productVariantService.applyChannelPriceAndTax(updatedOrderLine.productVariant, ctx, order);
                let priceResult = await orderItemPriceCalculationStrategy.calculateUnitPrice(ctx, variant, updatedOrderLine.customFields || {});
                const initialListPrice = (_b = (_a = updatedOrderLine.items.find(i => i.initialListPrice != null)) === null || _a === void 0 ? void 0 : _a.initialListPrice) !== null && _b !== void 0 ? _b : priceResult.price;
                if (initialListPrice !== priceResult.price) {
                    priceResult = await changedPriceHandlingStrategy.handlePriceChange(ctx, priceResult, updatedOrderLine.items);
                }
                for (const item of updatedOrderLine.items) {
                    if (item.initialListPrice == null) {
                        item.initialListPrice = initialListPrice;
                    }
                    item.listPrice = priceResult.price;
                    item.listPriceIncludesTax = priceResult.priceIncludesTax;
                }
            }
        }
        let myorderBarcodes = [];
        myorderBarcodes.push('');
        for (const orderLine of order.lines) {
            myorderBarcodes.push(orderLine.productVariant.sku)
        }
        const { items: promotions } = await this.promotionService.findAll(ctx, {
            filter: { promoSKU: {in:myorderBarcodes} },
            sort: { priorityScore: 'ASC' },
        });
        const updatedItems = await this.orderCalculator.applyPriceAdjustments(ctx, order, promotions, updatedOrderLines !== null && updatedOrderLines !== void 0 ? updatedOrderLines : []);
        const updateFields = [
            'initialListPrice',
            'listPrice',
            'listPriceIncludesTax',
            'adjustments',
            'taxLines',
        ];
        await this.connection
            .getRepository(ctx, order_item_entity_1.OrderItem)
            .createQueryBuilder()
            .insert()
            .into(order_item_entity_1.OrderItem, [...updateFields, 'id', 'lineId'])
            .values(updatedItems)
            .orUpdate({
            conflict_target: ['id'],
            overwrite: updateFields,
        })
            .updateEntity(false)
            .execute();
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        await this.connection.getRepository(ctx, shipping_line_entity_1.ShippingLine).save(order.shippingLines, { reload: false });
        return order;
    }
    async getOrderWithFulfillments(ctx, orderId) {
        return await this.connection.getEntityOrThrow(ctx, order_entity_1.Order, orderId, {
            relations: ['lines', 'lines.items', 'lines.items.fulfillments'],
        });
    }
    async getOrdersAndItemsFromLines(ctx, orderLinesInput, itemMatcher) {
        const orders = new Map();
        const items = new Map();
        const lines = await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).findByIds(orderLinesInput.map(l => l.orderLineId), {
            relations: ['order', 'items', 'items.fulfillments', 'order.channels', 'items.refund'],
            order: { id: 'ASC' },
        });
        for (const line of lines) {
            const inputLine = orderLinesInput.find(l => utils_1.idsAreEqual(l.orderLineId, line.id));
            if (!inputLine) {
                continue;
            }
            const order = line.order;
            if (!order.channels.some(channel => channel.id === ctx.channelId)) {
                throw new errors_1.EntityNotFoundError('Order', order.id);
            }
            if (!orders.has(order.id)) {
                orders.set(order.id, order);
            }
            const matchingItems = line.items.sort((a, b) => (a.id < b.id ? -1 : 1)).filter(itemMatcher);
            if (matchingItems.length < inputLine.quantity) {
                return false;
            }
            matchingItems.slice(0, inputLine.quantity).forEach(item => {
                items.set(item.id, item);
            });
        }
        return {
            orders: Array.from(orders.values()),
            items: Array.from(items.values()),
        };
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
    async groupOrderItemsIntoLines(ctx, orderItems) {
        const orderLineIdQuantityMap = new Map();
        for (const item of orderItems) {
            const quantity = orderLineIdQuantityMap.get(item.lineId);
            if (quantity == null) {
                orderLineIdQuantityMap.set(item.lineId, 1);
            }
            else {
                orderLineIdQuantityMap.set(item.lineId, quantity + 1);
            }
        }
        const orderLines = await this.connection
            .getRepository(ctx, order_line_entity_1.OrderLine)
            .findByIds([...orderLineIdQuantityMap.keys()], {
            relations: ['productVariant'],
        });
        return orderLines.map(orderLine => ({
            orderLine,
            // tslint:disable-next-line:no-non-null-assertion
            quantity: orderLineIdQuantityMap.get(orderLine.id),
        }));
    }
};
OrderService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        product_variant_service_1.ProductVariantService,
        customer_service_1.CustomerService,
        country_service_1.CountryService,
        order_calculator_1.OrderCalculator,
        shipping_calculator_1.ShippingCalculator,
        order_state_machine_1.OrderStateMachine,
        order_merger_1.OrderMerger,
        payment_service_1.PaymentService,
        payment_state_machine_1.PaymentStateMachine,
        payment_method_service_1.PaymentMethodService,
        fulfillment_service_1.FulfillmentService,
        list_query_builder_1.ListQueryBuilder,
        stock_movement_service_1.StockMovementService,
        refund_state_machine_1.RefundStateMachine,
        history_service_1.HistoryService,
        promotion_service_1.PromotionService,
        event_bus_1.EventBus,
        channel_service_1.ChannelService,
        order_modifier_1.OrderModifier,
        custom_field_relation_service_1.CustomFieldRelationService,
        request_context_cache_service_1.RequestContextCacheService])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map