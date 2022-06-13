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
exports.OrderCalculator = void 0;
const common_1 = require("@nestjs/common");
const filter_async_1 = require("@vendure/common/lib/filter-async");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const request_context_cache_service_1 = require("../../../cache/request-context-cache.service");
const errors_1 = require("../../../common/error/errors");
const tax_utils_1 = require("../../../common/tax-utils");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const shipping_method_service_1 = require("../../services/shipping-method.service");
const tax_rate_service_1 = require("../../services/tax-rate.service");
const zone_service_1 = require("../../services/zone.service");
const shipping_calculator_1 = require("../shipping-calculator/shipping-calculator");
const prorate_1 = require("./prorate");
let OrderCalculator = class OrderCalculator {
    constructor(configService, zoneService, taxRateService, shippingMethodService, shippingCalculator, requestContextCache) {
        this.configService = configService;
        this.zoneService = zoneService;
        this.taxRateService = taxRateService;
        this.shippingMethodService = shippingMethodService;
        this.shippingCalculator = shippingCalculator;
        this.requestContextCache = requestContextCache;
    }
    /**
     * Applies taxes and promotions to an Order. Mutates the order object.
     * Returns an array of any OrderItems which had new adjustments
     * applied, either tax or promotions.
     */
    async applyPriceAdjustments(ctx, order, promotions, updatedOrderLines = [], options) {
        const { taxZoneStrategy } = this.configService.taxOptions;
        const zones = await this.zoneService.findAll(ctx);
        const activeTaxZone = await this.requestContextCache.get(ctx, 'activeTaxZone', () => taxZoneStrategy.determineTaxZone(ctx, zones, ctx.channel, order));
        let taxZoneChanged = false;
        if (!activeTaxZone) {
            throw new errors_1.InternalServerError(`error.no-active-tax-zone`);
        }
        if (!order.taxZoneId || !utils_1.idsAreEqual(order.taxZoneId, activeTaxZone.id)) {
            order.taxZoneId = activeTaxZone.id;
            taxZoneChanged = true;
        }
        const updatedOrderItems = new Set();
        for (const updatedOrderLine of updatedOrderLines) {
            await this.applyTaxesToOrderLine(ctx, order, updatedOrderLine, activeTaxZone, this.createTaxRateGetter(ctx, activeTaxZone));
            updatedOrderLine.activeItems.forEach(item => updatedOrderItems.add(item));
        }
        this.calculateOrderTotals(order);
        if (order.lines.length) {
            if (taxZoneChanged) {
                // First apply taxes to the non-discounted prices
                await this.applyTaxes(ctx, order, activeTaxZone);
            }
            // Then test and apply promotions
            const totalBeforePromotions = order.subTotal;
            const itemsModifiedByPromotions = await this.applyPromotions(ctx, order, promotions);
            itemsModifiedByPromotions.forEach(item => updatedOrderItems.add(item));
            if (order.subTotal !== totalBeforePromotions || itemsModifiedByPromotions.length) {
                // Finally, re-calculate taxes because the promotions may have
                // altered the unit prices, which in turn will alter the tax payable.
                await this.applyTaxes(ctx, order, activeTaxZone);
            }
        }
        this.calculateOrderTotals(order);
        return taxZoneChanged ? order.getOrderItems() : Array.from(updatedOrderItems);
    }
    /**
     * Applies the correct TaxRate to each OrderItem in the order.
     */
    async applyTaxes(ctx, order, activeZone) {
        const getTaxRate = this.createTaxRateGetter(ctx, activeZone);
        for (const line of order.lines) {
            await this.applyTaxesToOrderLine(ctx, order, line, activeZone, getTaxRate);
        }
        this.calculateOrderTotals(order);
    }
    /**
     * Applies the correct TaxRate to an OrderLine
     */
    async applyTaxesToOrderLine(ctx, order, line, activeZone, getTaxRate) {
        const applicableTaxRate = await getTaxRate(line.taxCategory);
        const { taxLineCalculationStrategy } = this.configService.taxOptions;
        for (const item of line.activeItems) {
            item.taxLines = await taxLineCalculationStrategy.calculate({
                ctx,
                applicableTaxRate,
                order,
                orderItem: item,
                orderLine: line,
            });
        }
    }
    /**
     * Returns a memoized function for performing an efficient
     * lookup of the correct TaxRate for a given TaxCategory.
     */
    createTaxRateGetter(ctx, activeZone) {
        const taxRateCache = new Map();
        return async (taxCategory) => {
            const cached = taxRateCache.get(taxCategory);
            if (cached) {
                return cached;
            }
            const rate = await this.taxRateService.getApplicableTaxRate(ctx, activeZone, taxCategory);
            taxRateCache.set(taxCategory, rate);
            return rate;
        };
    }
    /**
     * Applies any eligible promotions to each OrderItem in the order. Returns an array of
     * any OrderItems which had their Adjustments modified.
     */
    async applyPromotions(ctx, order, promotions) {
        const updatedItems = await this.applyOrderItemPromotions(ctx, order, promotions);
        const orderUpdatedItems = await this.applyOrderPromotions(ctx, order, promotions);
        if (orderUpdatedItems.length) {
            return orderUpdatedItems;
        }
        else {
            return updatedItems;
        }
    }
    /**
     * Applies promotions to OrderItems. This is a quite complex function, due to the inherent complexity
     * of applying the promotions, and also due to added complexity in the name of performance
     * optimization. Therefore it is heavily annotated so that the purpose of each step is clear.
     */
    async applyOrderItemPromotions(ctx, order, promotions) {
        var _a, _b, _c, _d;
        // The naive implementation updates *every* OrderItem after this function is run.
        // However, on a very large order with hundreds or thousands of OrderItems, this results in
        // very poor performance. E.g. updating a single quantity of an OrderLine results in saving
        // all 1000 (for example) OrderItems to the DB.
        // The solution is to try to be smart about tracking exactly which OrderItems have changed,
        // so that we only update those.
        const updatedOrderItems = new Set();
        for (const line of order.lines) {
            // Must be re-calculated for each line, since the previous lines may have triggered promotions
            // which affected the order price.
            const initApplicablePromotions = await filter_async_1.filterAsync(promotions, p => p.test(ctx, order).then(Boolean));
            const applicablePromotions =  Object.values(initApplicablePromotions.reduce((r, o) => {
                const oSku = o.customFields.promoSKU
                r[oSku] = (r[oSku] && r[oSku].priorityScore < o.priorityScore) ? r[oSku] : o
                return r
              }, {}));
            const lineHasExistingPromotions = !!((_b = (_a = line.firstItem) === null || _a === void 0 ? void 0 : _a.adjustments) === null || _b === void 0 ? void 0 : _b.find(a => a.type === generated_types_1.AdjustmentType.PROMOTION));
            const forceUpdateItems = this.orderLineHasInapplicablePromotions(applicablePromotions, line);
            if (forceUpdateItems || lineHasExistingPromotions) {
                line.clearAdjustments();
            }
            if (forceUpdateItems) {
                // This OrderLine contains Promotion adjustments for Promotions that are no longer
                // applicable. So we know for sure we will need to update these OrderItems in the
                // DB. Therefore add them to the `updatedOrderItems` set.
                line.items.forEach(i => updatedOrderItems.add(i));
            }
            for (const promotion of applicablePromotions) {
                let priceAdjusted = false;
                // We need to test the promotion *again*, even though we've tested them for the line.
                // This is because the previous Promotions may have adjusted the Order in such a way
                // as to render later promotions no longer applicable.
                const applicableOrState = await promotion.test(ctx, order);
                if (applicableOrState) {
                    const state = typeof applicableOrState === 'object' ? applicableOrState : undefined;
                    for (const item of line.items) {
                        const adjustment = await promotion.apply(ctx, {
                            orderItem: item,
                            orderLine: line,
                        }, state);
                        if (adjustment) {
                            item.addAdjustment(adjustment);
                            priceAdjusted = true;
                            updatedOrderItems.add(item);
                        }
                    }
                    if (priceAdjusted) {
                        this.calculateOrderTotals(order);
                        priceAdjusted = false;
                    }
                }
            }
            const lineNoLongerHasPromotions = !((_d = (_c = line.firstItem) === null || _c === void 0 ? void 0 : _c.adjustments) === null || _d === void 0 ? void 0 : _d.find(a => a.type === generated_types_1.AdjustmentType.PROMOTION));
            if (lineHasExistingPromotions && lineNoLongerHasPromotions) {
                line.items.forEach(i => updatedOrderItems.add(i));
            }
            if (forceUpdateItems) {
                // If we are forcing an update, we need to ensure that totals get
                // re-calculated *even if* there are no applicable promotions (i.e.
                // the other call to `this.calculateOrderTotals()` inside the `for...of`
                // loop was never invoked).
                this.calculateOrderTotals(order);
            }
        }
        return Array.from(updatedOrderItems.values());
    }
    /**
     * An OrderLine may have promotion adjustments from Promotions which are no longer applicable.
     * For example, a coupon code might have caused a discount to be applied, and now that code has
     * been removed from the order. The adjustment will still be there on each OrderItem it was applied
     * to, even though that Promotion is no longer found in the `applicablePromotions` array.
     *
     * We need to know about this because it means that all OrderItems in the OrderLine must be
     * updated.
     */
    orderLineHasInapplicablePromotions(applicablePromotions, line) {
        const applicablePromotionIds = applicablePromotions.map(p => p.getSourceId());
        const linePromotionIds = line.adjustments
            .filter(a => a.type === generated_types_1.AdjustmentType.PROMOTION)
            .map(a => a.adjustmentSource);
        const hasPromotionsThatAreNoLongerApplicable = !linePromotionIds.every(id => applicablePromotionIds.includes(id));
        return hasPromotionsThatAreNoLongerApplicable;
    }
    async applyOrderPromotions(ctx, order, promotions) {
        const updatedItems = new Set();
        const orderHasDistributedPromotions = !!order.discounts.find(adjustment => adjustment.type === generated_types_1.AdjustmentType.DISTRIBUTED_ORDER_PROMOTION);
        if (orderHasDistributedPromotions) {
            // If the Order currently has any Order-level discounts applied, we need to
            // mark all OrderItems in the Order as "updated", since one or more of those
            // Order-level discounts may become invalid, which will require _all_ OrderItems
            // to be saved.
            order.lines.forEach(line => {
                line.clearAdjustments(generated_types_1.AdjustmentType.DISTRIBUTED_ORDER_PROMOTION);
                line.items.forEach(item => updatedItems.add(item));
            });
        }
        this.calculateOrderTotals(order);
        const applicableOrderPromotions = await filter_async_1.filterAsync(promotions, p => p.test(ctx, order).then(Boolean));
        if (applicableOrderPromotions.length) {
            for (const promotion of applicableOrderPromotions) {
                // re-test the promotion on each iteration, since the order total
                // may be modified by a previously-applied promotion
                const applicableOrState = await promotion.test(ctx, order);
                if (applicableOrState) {
                    const state = typeof applicableOrState === 'object' ? applicableOrState : undefined;
                    const adjustment = await promotion.apply(ctx, { order }, state);
                    if (adjustment && adjustment.amount !== 0) {
                        const amount = adjustment.amount;
                        let filterLines = order.lines.filter(line => {
                            return line.productVariant.customFields.promoSKU == promotion.customFields.promoSKU
                        })
                        if (filterLines.length > 0) {
                            order.lines.forEach((line, i) => {
                                if (line.id == filterLines[0].id) {
                                    updatedItems.add(line.items[0]);
                                    line.items[0].addAdjustment(adjustment)
                                }
                            });
                        }
                        /*
                        //                        const weights = order.lines.map(l => l.proratedLinePriceWithTax);
                        //                        const distribution = prorate_1.prorate(weights, amount);
                        order.lines.forEach((line, i) => {
                            const shareOfAmount = distribution[i];
                            const itemWeights = line.items.map(item => item.unitPrice);
                            const itemDistribution = prorate_1.prorate(itemWeights, shareOfAmount);
                            line.items.forEach((item, j) => {
                                const discount = itemDistribution[j];
                                const adjustedDiscount = item.listPriceIncludesTax
                                    ? tax_utils_1.netPriceOf(amount, item.taxRate)
                                    : amount;
                                // Note: At this point, any time we have an Order-level discount being applied,
                                // we are effectively nuking all the performance optimizations we have for updating
                                // as few OrderItems as possible (see notes in the `applyOrderItemPromotions()` method).
                                // This is because we are prorating any Order-level discounts over _all_ OrderItems.
                                // (see https://github.com/vendure-ecommerce/vendure/issues/573 for a detailed discussion
                                // as to why). The are ways to optimize this, but for now I am leaving the implementation
                                // as-is, and we can deal with performance issues later. Correctness is more important
                                // when is comes to price & tax calculations.
                                updatedItems.add(item);
                                item.addAdjustment({
                                    amount: discount,
                                    adjustmentSource: adjustment.adjustmentSource,
                                    description: adjustment.description,
                                    type: generated_types_1.AdjustmentType.DISTRIBUTED_ORDER_PROMOTION,
                                });
                            });
                        }); */
                        this.calculateOrderTotals(order);
                    }
                }
            }
            this.calculateOrderTotals(order);
        }
        return Array.from(updatedItems.values());
    }
    async applyShippingPromotions(ctx, order, promotions) {
        const applicableOrderPromotions = await filter_async_1.filterAsync(promotions, p => p.test(ctx, order).then(Boolean));
        if (applicableOrderPromotions.length) {
            order.shippingLines.forEach(line => line.clearAdjustments());
            for (const promotion of applicableOrderPromotions) {
                // re-test the promotion on each iteration, since the order total
                // may be modified by a previously-applied promotion
                const applicableOrState = await promotion.test(ctx, order);
                if (applicableOrState) {
                    const state = typeof applicableOrState === 'object' ? applicableOrState : undefined;
                    for (const shippingLine of order.shippingLines) {
                        const adjustment = await promotion.apply(ctx, { shippingLine, order }, state);
                        if (adjustment && adjustment.amount !== 0) {
                            shippingLine.addAdjustment(adjustment);
                        }
                    }
                }
            }
        }
        else {
            // If there is no applicable promotion for shipping,
            // we should remove already assigned adjustment from shipping lines.
            for (const shippingLine of order.shippingLines) {
                shippingLine.clearAdjustments();
            }
        }
    }
    async applyShipping(ctx, order) {
        const shippingLine = order.shippingLines[0];
        const currentShippingMethod = (shippingLine === null || shippingLine === void 0 ? void 0 : shippingLine.shippingMethodId) &&
            (await this.shippingMethodService.findOne(ctx, shippingLine.shippingMethodId));
        if (!currentShippingMethod) {
            return;
        }
        const currentMethodStillEligible = await currentShippingMethod.test(ctx, order);
        if (currentMethodStillEligible) {
            const result = await currentShippingMethod.apply(ctx, order);
            if (result) {
                shippingLine.listPrice = result.price;
                shippingLine.listPriceIncludesTax = result.priceIncludesTax;
                shippingLine.taxLines = [
                    {
                        description: 'shipping tax',
                        taxRate: result.taxRate,
                    },
                ];
            }
            return;
        }
        const results = await this.shippingCalculator.getEligibleShippingMethods(ctx, order, [
            currentShippingMethod.id,
        ]);
        if (results && results.length) {
            const cheapest = results[0];
            shippingLine.listPrice = cheapest.result.price;
            shippingLine.listPriceIncludesTax = cheapest.result.priceIncludesTax;
            shippingLine.shippingMethod = cheapest.method;
            shippingLine.shippingMethodId = cheapest.method.id;
            shippingLine.taxLines = [
                {
                    description: 'shipping tax',
                    taxRate: cheapest.result.taxRate,
                },
            ];
        }
        else {
            order.shippingLines = [];
        }
    }
    calculateOrderTotals(order) {
        let totalPrice = 0;
        let totalPriceWithTax = 0;
        for (const line of order.lines) {
            totalPrice += line.proratedLinePrice;
            totalPriceWithTax += line.proratedLinePriceWithTax;
        }
        for (const surcharge of order.surcharges) {
            totalPrice += surcharge.price;
            totalPriceWithTax += surcharge.priceWithTax;
        }
        order.subTotal = totalPrice;
        order.subTotalWithTax = totalPriceWithTax;
        let shippingPrice = 0;
        let shippingPriceWithTax = 0;
        for (const shippingLine of order.shippingLines) {
            shippingPrice += shippingLine.discountedPrice;
            shippingPriceWithTax += shippingLine.discountedPriceWithTax;
        }
        order.shipping = shippingPrice;
        order.shippingWithTax = shippingPriceWithTax;
    }
};
OrderCalculator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        zone_service_1.ZoneService,
        tax_rate_service_1.TaxRateService,
        shipping_method_service_1.ShippingMethodService,
        shipping_calculator_1.ShippingCalculator,
        request_context_cache_service_1.RequestContextCacheService])
], OrderCalculator);
exports.OrderCalculator = OrderCalculator;
//# sourceMappingURL=order-calculator.js.map