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
exports.ProductPriceApplicator = void 0;
const common_1 = require("@nestjs/common");
const request_context_cache_service_1 = require("../../../cache/request-context-cache.service");
const errors_1 = require("../../../common/error/errors");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const tax_rate_service_1 = require("../../services/tax-rate.service");
const zone_service_1 = require("../../services/zone.service");
/**
 * @description
 * This helper is used to apply the correct price to a ProductVariant based on the current context
 * including active Channel, any current Order, etc.
 */
let ProductPriceApplicator = class ProductPriceApplicator {
    constructor(configService, taxRateService, zoneService, requestCache) {
        this.configService = configService;
        this.taxRateService = taxRateService;
        this.zoneService = zoneService;
        this.requestCache = requestCache;
    }
    /**
     * @description
     * Populates the `price` field with the price for the specified channel.
     */
    async applyChannelPriceAndTax(variant, ctx, order) {
        const channelPrice = variant.productVariantPrices.find(p => utils_1.idsAreEqual(p.channelId, ctx.channelId));
        if (!channelPrice) {
            throw new errors_1.InternalServerError(`error.no-price-found-for-channel`, {
                variantId: variant.id,
                channel: ctx.channel.code,
            });
        }
        const { taxZoneStrategy } = this.configService.taxOptions;
        const zones = await this.requestCache.get(ctx, 'allZones', () => this.zoneService.findAll(ctx));
        const activeTaxZone = await this.requestCache.get(ctx, `activeTaxZone`, () => taxZoneStrategy.determineTaxZone(ctx, zones, ctx.channel, order));
        if (!activeTaxZone) {
            throw new errors_1.InternalServerError(`error.no-active-tax-zone`);
        }
        const applicableTaxRate = await this.requestCache.get(ctx, `applicableTaxRate-${activeTaxZone.id}-${variant.taxCategory.id}`, () => this.taxRateService.getApplicableTaxRate(ctx, activeTaxZone, variant.taxCategory));
        const { productVariantPriceCalculationStrategy } = this.configService.catalogOptions;
        const { price, priceIncludesTax } = await productVariantPriceCalculationStrategy.calculate({
            inputPrice: channelPrice.price,
            taxCategory: variant.taxCategory,
            activeTaxZone,
            ctx,
        });
        variant.listPrice = price;
        variant.listPriceIncludesTax = priceIncludesTax;
        variant.taxRateApplied = applicableTaxRate;
        variant.currencyCode = ctx.channel.currencyCode;
        return variant;
    }
};
ProductPriceApplicator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        tax_rate_service_1.TaxRateService,
        zone_service_1.ZoneService,
        request_context_cache_service_1.RequestContextCacheService])
], ProductPriceApplicator);
exports.ProductPriceApplicator = ProductPriceApplicator;
//# sourceMappingURL=product-price-applicator.js.map