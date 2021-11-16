"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultProductVariantPriceCalculationStrategy = void 0;
const utils_1 = require("../../common/utils");
const tax_rate_service_1 = require("../../service/services/tax-rate.service");
/**
 * @description
 * A default ProductVariant price calculation function.
 *
 * @docsCategory tax
 */
class DefaultProductVariantPriceCalculationStrategy {
    init(injector) {
        this.taxRateService = injector.get(tax_rate_service_1.TaxRateService);
    }
    async calculate(args) {
        const { inputPrice, activeTaxZone, ctx, taxCategory } = args;
        let price = inputPrice;
        let priceIncludesTax = false;
        const taxRate = await this.taxRateService.getApplicableTaxRate(ctx, activeTaxZone, taxCategory);
        if (ctx.channel.pricesIncludeTax) {
            const isDefaultZone = utils_1.idsAreEqual(activeTaxZone.id, ctx.channel.defaultTaxZone.id);
            if (isDefaultZone) {
                priceIncludesTax = true;
            }
            else {
                const taxRateForDefaultZone = await this.taxRateService.getApplicableTaxRate(ctx, ctx.channel.defaultTaxZone, taxCategory);
                price = taxRateForDefaultZone.netPriceOf(inputPrice);
            }
        }
        return {
            price,
            priceIncludesTax,
        };
    }
}
exports.DefaultProductVariantPriceCalculationStrategy = DefaultProductVariantPriceCalculationStrategy;
//# sourceMappingURL=default-product-variant-price-calculation-strategy.js.map