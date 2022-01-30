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
exports.OrderModifier = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const error_result_1 = require("../../../common/error/error-result");
const errors_1 = require("../../../common/error/errors");
const generated_graphql_admin_errors_1 = require("../../../common/error/generated-graphql-admin-errors");
const generated_graphql_shop_errors_1 = require("../../../common/error/generated-graphql-shop-errors");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const transactional_connection_1 = require("../../../connection/transactional-connection");
const order_item_entity_1 = require("../../../entity/order-item/order-item.entity");
const order_line_entity_1 = require("../../../entity/order-line/order-line.entity");
const order_modification_entity_1 = require("../../../entity/order-modification/order-modification.entity");
const order_entity_1 = require("../../../entity/order/order.entity");
const payment_entity_1 = require("../../../entity/payment/payment.entity");
const promotion_entity_1 = require("../../../entity/promotion/promotion.entity");
const shipping_line_entity_1 = require("../../../entity/shipping-line/shipping-line.entity");
const surcharge_entity_1 = require("../../../entity/surcharge/surcharge.entity");
const country_service_1 = require("../../services/country.service");
const payment_service_1 = require("../../services/payment.service");
const product_variant_service_1 = require("../../services/product-variant.service");
const stock_movement_service_1 = require("../../services/stock-movement.service");
const custom_field_relation_service_1 = require("../custom-field-relation/custom-field-relation.service");
const order_calculator_1 = require("../order-calculator/order-calculator");
const patch_entity_1 = require("../utils/patch-entity");
const translate_entity_1 = require("../utils/translate-entity");
/**
 * @description
 * This helper is responsible for modifying the contents of an Order.
 *
 * Note:
 * There is not a clear separation of concerns between the OrderService and this, since
 * the OrderService also contains some method which modify the Order (e.g. removeItemFromOrder).
 * So this helper was mainly extracted to isolate the huge `modifyOrder` method since the
 * OrderService was just growing too large. Future refactoring could improve the organization
 * of these Order-related methods into a more clearly-delineated set of classes.
 */
let OrderModifier = class OrderModifier {
    constructor(connection, configService, orderCalculator, paymentService, countryService, stockMovementService, productVariantService, customFieldRelationService) {
        this.connection = connection;
        this.configService = configService;
        this.orderCalculator = orderCalculator;
        this.paymentService = paymentService;
        this.countryService = countryService;
        this.stockMovementService = stockMovementService;
        this.productVariantService = productVariantService;
        this.customFieldRelationService = customFieldRelationService;
    }
    /**
     * Ensure that the ProductVariant has sufficient saleable stock to add the given
     * quantity to an Order.
     */
    async constrainQuantityToSaleable(ctx, variant, quantity, existingQuantity = 0) {
        let correctedQuantity = quantity + existingQuantity;
        const saleableStockLevel = await this.productVariantService.getSaleableStockLevel(ctx, variant);
        if (saleableStockLevel < correctedQuantity) {
            correctedQuantity = Math.max(saleableStockLevel - existingQuantity, 0);
        }
        return correctedQuantity;
    }
    async getExistingOrderLine(ctx, order, productVariantId, customFields) {
        for (const line of order.lines) {
            const match = utils_1.idsAreEqual(line.productVariant.id, productVariantId) &&
                (await this.customFieldsAreEqual(ctx, line, customFields, line.customFields));
            if (match) {
                return line;
            }
        }
    }
    /**
     * Returns the OrderLine to which a new OrderItem belongs, creating a new OrderLine
     * if no existing line is found.
     */
    async getOrCreateOrderLine(ctx, order, productVariantId, customFields) {
        const existingOrderLine = await this.getExistingOrderLine(ctx, order, productVariantId, customFields);
        if (existingOrderLine) {
            return existingOrderLine;
        }
        const productVariant = await this.getProductVariantOrThrow(ctx, productVariantId);
        const orderLine = await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).save(new order_line_entity_1.OrderLine({
            productVariant,
            taxCategory: productVariant.taxCategory,
            featuredAsset: productVariant.product.featuredAsset,
            customFields,
        }));
        await this.customFieldRelationService.updateRelations(ctx, order_line_entity_1.OrderLine, { customFields }, orderLine);
        const lineWithRelations = await this.connection.getEntityOrThrow(ctx, order_line_entity_1.OrderLine, orderLine.id, {
            relations: [
                'items',
                'taxCategory',
                'productVariant',
                'productVariant.productVariantPrices',
                'productVariant.taxCategory',
            ],
        });
        lineWithRelations.productVariant = translate_entity_1.translateDeep(await this.productVariantService.applyChannelPriceAndTax(lineWithRelations.productVariant, ctx, order), ctx.languageCode);
        order.lines.push(lineWithRelations);
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        return lineWithRelations;
    }
    /**
     * Updates the quantity of an OrderLine, taking into account the available saleable stock level.
     * Returns the actual quantity that the OrderLine was updated to (which may be less than the
     * `quantity` argument if insufficient stock was available.
     */
    async updateOrderLineQuantity(ctx, orderLine, quantity, order) {
        const currentQuantity = orderLine.quantity;
        if (currentQuantity < quantity) {
            if (!orderLine.items) {
                orderLine.items = [];
            }
            const newOrderItems = [];
            for (let i = currentQuantity; i < quantity; i++) {
                newOrderItems.push(new order_item_entity_1.OrderItem({
                    listPrice: orderLine.productVariant.listPrice,
                    listPriceIncludesTax: orderLine.productVariant.listPriceIncludesTax,
                    adjustments: [],
                    taxLines: [],
                    lineId: orderLine.id,
                }));
            }
            const { identifiers } = await this.connection
                .getRepository(ctx, order_item_entity_1.OrderItem)
                .createQueryBuilder()
                .insert()
                .into(order_item_entity_1.OrderItem)
                .values(newOrderItems)
                .execute();
            newOrderItems.forEach((item, i) => (item.id = identifiers[i].id));
            orderLine.items = await this.connection
                .getRepository(ctx, order_item_entity_1.OrderItem)
                .find({ where: { line: orderLine } });
            if (!order.active) {
                await this.stockMovementService.createAllocationsForOrderLines(ctx, [
                    {
                        orderLine,
                        quantity: quantity - currentQuantity,
                    },
                ]);
            }
        }
        else if (quantity < currentQuantity) {
            if (order.active) {
                // When an Order is still active, it is fine to just delete
                // any OrderItems that are no longer needed
                const keepItems = orderLine.items.slice(0, quantity);
                const removeItems = orderLine.items.slice(quantity);
                orderLine.items = keepItems;
                await this.connection
                    .getRepository(ctx, order_item_entity_1.OrderItem)
                    .createQueryBuilder()
                    .delete()
                    .whereInIds(removeItems.map(i => i.id))
                    .execute();
            }
            else {
                // When an Order is not active (i.e. Customer checked out), then we don't want to just
                // delete the OrderItems - instead we will cancel them
                const toSetAsCancelled = orderLine.items.filter(i => !i.cancelled).slice(quantity);
                const fulfilledItems = toSetAsCancelled.filter(i => !!i.fulfillment);
                const allocatedItems = toSetAsCancelled.filter(i => !i.fulfillment);
                await this.stockMovementService.createCancellationsForOrderItems(ctx, fulfilledItems);
                await this.stockMovementService.createReleasesForOrderItems(ctx, allocatedItems);
                toSetAsCancelled.forEach(i => (i.cancelled = true));
                await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).save(toSetAsCancelled, { reload: false });
            }
        }
        await this.connection.getRepository(ctx, order_line_entity_1.OrderLine).save(orderLine);
        return orderLine;
    }
    async modifyOrder(ctx, input, order) {
        var _a, _b, _c, _d, _e, _f, _g;
        const { dryRun } = input;
        const modification = new order_modification_entity_1.OrderModification({
            order,
            note: input.note || '',
            orderItems: [],
            surcharges: [],
        });
        const initialTotalWithTax = order.totalWithTax;
        const initialShippingWithTax = order.shippingWithTax;
        if (order.state !== 'Modifying') {
            return new generated_graphql_admin_errors_1.OrderModificationStateError();
        }
        if (this.noChangesSpecified(input)) {
            return new generated_graphql_admin_errors_1.NoChangesSpecifiedError();
        }
        const { orderItemsLimit } = this.configService.orderOptions;
        let currentItemsCount = shared_utils_1.summate(order.lines, 'quantity');
        const updatedOrderLineIds = [];
        const refundInput = {
            lines: [],
            adjustment: 0,
            shipping: 0,
            paymentId: ((_a = input.refund) === null || _a === void 0 ? void 0 : _a.paymentId) || '',
            reason: ((_b = input.refund) === null || _b === void 0 ? void 0 : _b.reason) || input.note,
            orderItems: [],
        };
        for (const row of (_c = input.addItems) !== null && _c !== void 0 ? _c : []) {
            const { productVariantId, quantity } = row;
            if (quantity < 0) {
                return new generated_graphql_shop_errors_1.NegativeQuantityError();
            }
            const customFields = row.customFields || {};
            const orderLine = await this.getOrCreateOrderLine(ctx, order, productVariantId, customFields);
            const correctedQuantity = await this.constrainQuantityToSaleable(ctx, orderLine.productVariant, quantity);
            if (orderItemsLimit < currentItemsCount + correctedQuantity) {
                return new generated_graphql_shop_errors_1.OrderLimitError(orderItemsLimit);
            }
            else {
                currentItemsCount += correctedQuantity;
            }
            if (correctedQuantity < quantity) {
                return new generated_graphql_shop_errors_1.InsufficientStockError(correctedQuantity, order);
            }
            updatedOrderLineIds.push(orderLine.id);
            const initialQuantity = orderLine.quantity;
            await this.updateOrderLineQuantity(ctx, orderLine, initialQuantity + correctedQuantity, order);
            modification.orderItems.push(...orderLine.items.slice(initialQuantity));
        }
        for (const row of (_d = input.adjustOrderLines) !== null && _d !== void 0 ? _d : []) {
            const { orderLineId, quantity } = row;
            if (quantity < 0) {
                return new generated_graphql_shop_errors_1.NegativeQuantityError();
            }
            const orderLine = order.lines.find(line => utils_1.idsAreEqual(line.id, orderLineId));
            if (!orderLine) {
                throw new errors_1.UserInputError(`error.order-does-not-contain-line-with-id`, { id: orderLineId });
            }
            const initialLineQuantity = orderLine.quantity;
            let correctedQuantity = quantity;
            if (initialLineQuantity < quantity) {
                const additionalQuantity = await this.constrainQuantityToSaleable(ctx, orderLine.productVariant, quantity - initialLineQuantity);
                correctedQuantity = initialLineQuantity + additionalQuantity;
            }
            const resultingOrderTotalQuantity = currentItemsCount + correctedQuantity - orderLine.quantity;
            if (orderItemsLimit < resultingOrderTotalQuantity) {
                return new generated_graphql_shop_errors_1.OrderLimitError(orderItemsLimit);
            }
            else {
                currentItemsCount += correctedQuantity;
            }
            if (correctedQuantity < quantity) {
                return new generated_graphql_shop_errors_1.InsufficientStockError(correctedQuantity, order);
            }
            else {
                const customFields = row.customFields;
                if (customFields) {
                    patch_entity_1.patchEntity(orderLine, { customFields });
                }
                await this.updateOrderLineQuantity(ctx, orderLine, quantity, order);
                if (correctedQuantity < initialLineQuantity) {
                    const qtyDelta = initialLineQuantity - correctedQuantity;
                    refundInput.lines.push({
                        orderLineId: orderLine.id,
                        quantity,
                    });
                    const cancelledOrderItems = orderLine.items.filter(i => i.cancelled).slice(0, qtyDelta);
                    refundInput.orderItems.push(...cancelledOrderItems);
                    modification.orderItems.push(...cancelledOrderItems);
                }
                else {
                    const addedOrderItems = orderLine.items
                        .filter(i => !i.cancelled)
                        .slice(initialLineQuantity);
                    modification.orderItems.push(...addedOrderItems);
                }
            }
            updatedOrderLineIds.push(orderLine.id);
        }
        for (const surchargeInput of (_e = input.surcharges) !== null && _e !== void 0 ? _e : []) {
            const taxLines = surchargeInput.taxRate != null
                ? [
                    {
                        taxRate: surchargeInput.taxRate,
                        description: surchargeInput.taxDescription || '',
                    },
                ]
                : [];
            const surcharge = await this.connection.getRepository(ctx, surcharge_entity_1.Surcharge).save(new surcharge_entity_1.Surcharge({
                sku: surchargeInput.sku || '',
                description: surchargeInput.description,
                listPrice: surchargeInput.price,
                listPriceIncludesTax: surchargeInput.priceIncludesTax,
                taxLines,
                order,
            }));
            order.surcharges.push(surcharge);
            modification.surcharges.push(surcharge);
            if (surcharge.priceWithTax < 0) {
                refundInput.adjustment += Math.abs(surcharge.priceWithTax);
            }
        }
        if ((_f = input.surcharges) === null || _f === void 0 ? void 0 : _f.length) {
            await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
        }
        if (input.updateShippingAddress) {
            order.shippingAddress = Object.assign(Object.assign({}, order.shippingAddress), input.updateShippingAddress);
            if (input.updateShippingAddress.countryCode) {
                const country = await this.countryService.findOneByCode(ctx, input.updateShippingAddress.countryCode);
                order.shippingAddress.country = country.name;
            }
            await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
            modification.shippingAddressChange = input.updateShippingAddress;
        }
        if (input.updateBillingAddress) {
            order.billingAddress = Object.assign(Object.assign({}, order.billingAddress), input.updateBillingAddress);
            if (input.updateBillingAddress.countryCode) {
                const country = await this.countryService.findOneByCode(ctx, input.updateBillingAddress.countryCode);
                order.billingAddress.country = country.name;
            }
            await this.connection.getRepository(ctx, order_entity_1.Order).save(order, { reload: false });
            modification.billingAddressChange = input.updateBillingAddress;
        }
        const updatedOrderLines = order.lines.filter(l => updatedOrderLineIds.includes(l.id));
        const promotions = await this.connection.getRepository(ctx, promotion_entity_1.Promotion).find({
            where: { enabled: true, deletedAt: null },
            order: { priorityScore: 'ASC' },
        });
        await this.orderCalculator.applyPriceAdjustments(ctx, order, promotions, updatedOrderLines, {
            recalculateShipping: (_g = input.options) === null || _g === void 0 ? void 0 : _g.recalculateShipping,
        });
        const orderCustomFields = input.customFields;
        if (orderCustomFields) {
            patch_entity_1.patchEntity(order, { customFields: orderCustomFields });
        }
        if (dryRun) {
            return { order, modification };
        }
        // Create the actual modification and commit all changes
        const newTotalWithTax = order.totalWithTax;
        const delta = newTotalWithTax - initialTotalWithTax;
        if (delta < 0) {
            if (!input.refund) {
                return new generated_graphql_admin_errors_1.RefundPaymentIdMissingError();
            }
            const shippingDelta = order.shippingWithTax - initialShippingWithTax;
            if (shippingDelta < 0) {
                refundInput.shipping = shippingDelta * -1;
            }
            const existingPayments = await this.getOrderPayments(ctx, order.id);
            const payment = existingPayments.find(p => { var _a; return utils_1.idsAreEqual(p.id, (_a = input.refund) === null || _a === void 0 ? void 0 : _a.paymentId); });
            if (payment) {
                const refund = await this.paymentService.createRefund(ctx, refundInput, order, refundInput.orderItems, payment);
                if (!error_result_1.isGraphQlErrorResult(refund)) {
                    modification.refund = refund;
                }
                else {
                    throw new errors_1.InternalServerError(refund.message);
                }
            }
        }
        modification.priceChange = delta;
        const createdModification = await this.connection
            .getRepository(ctx, order_modification_entity_1.OrderModification)
            .save(modification);
        await this.connection.getRepository(ctx, order_entity_1.Order).save(order);
        await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).save(modification.orderItems, { reload: false });
        await this.connection.getRepository(ctx, shipping_line_entity_1.ShippingLine).save(order.shippingLines, { reload: false });
        return { order, modification: createdModification };
    }
    noChangesSpecified(input) {
        var _a, _b, _c;
        const noChanges = !((_a = input.adjustOrderLines) === null || _a === void 0 ? void 0 : _a.length) &&
            !((_b = input.addItems) === null || _b === void 0 ? void 0 : _b.length) &&
            !((_c = input.surcharges) === null || _c === void 0 ? void 0 : _c.length) &&
            !input.updateShippingAddress &&
            !input.updateBillingAddress &&
            !input.customFields;
        return noChanges;
    }
    getOrderPayments(ctx, orderId) {
        return this.connection.getRepository(ctx, payment_entity_1.Payment).find({
            relations: ['refunds'],
            where: {
                order: { id: orderId },
            },
        });
    }
    async customFieldsAreEqual(ctx, orderLine, inputCustomFields, existingCustomFields) {
        if (inputCustomFields == null && typeof existingCustomFields === 'object') {
            // A null value for an OrderLine customFields input is the equivalent
            // of every property of an existing customFields object being null.
            return Object.values(existingCustomFields).every(v => v === null);
        }
        const customFieldDefs = this.configService.customFields.OrderLine;
        const customFieldRelations = customFieldDefs.filter(d => d.type === 'relation');
        let lineWithCustomFieldRelations;
        if (customFieldRelations.length) {
            // for relation types, we need to actually query the DB and check if there is an
            // existing entity assigned.
            lineWithCustomFieldRelations = await this.connection
                .getRepository(ctx, order_line_entity_1.OrderLine)
                .findOne(orderLine.id, {
                relations: customFieldRelations.map(r => `customFields.${r.name}`),
            });
        }
        for (const def of customFieldDefs) {
            const key = def.name;
            const existingValue = existingCustomFields === null || existingCustomFields === void 0 ? void 0 : existingCustomFields[key];
            if (existingValue !== undefined) {
                const valuesMatch = JSON.stringify(inputCustomFields === null || inputCustomFields === void 0 ? void 0 : inputCustomFields[key]) === JSON.stringify(existingValue);
                const undefinedMatchesNull = existingValue === null && (inputCustomFields === null || inputCustomFields === void 0 ? void 0 : inputCustomFields[key]) === undefined;
                if (!valuesMatch && !undefinedMatchesNull) {
                    return false;
                }
            }
            else if (def.type === 'relation') {
                const inputId = `${key}Id`;
                const inputValue = inputCustomFields === null || inputCustomFields === void 0 ? void 0 : inputCustomFields[inputId];
                // tslint:disable-next-line:no-non-null-assertion
                const existingRelation = lineWithCustomFieldRelations.customFields[key];
                if (inputValue && inputValue !== (existingRelation === null || existingRelation === void 0 ? void 0 : existingRelation.id)) {
                    return false;
                }
            }
        }
        return true;
    }
    async getProductVariantOrThrow(ctx, productVariantId) {
        const productVariant = await this.productVariantService.findOne(ctx, productVariantId);
        if (!productVariant) {
            throw new errors_1.EntityNotFoundError('ProductVariant', productVariantId);
        }
        return productVariant;
    }
};
OrderModifier = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        order_calculator_1.OrderCalculator,
        payment_service_1.PaymentService,
        country_service_1.CountryService,
        stock_movement_service_1.StockMovementService,
        product_variant_service_1.ProductVariantService,
        custom_field_relation_service_1.CustomFieldRelationService])
], OrderModifier);
exports.OrderModifier = OrderModifier;
//# sourceMappingURL=order-modifier.js.map