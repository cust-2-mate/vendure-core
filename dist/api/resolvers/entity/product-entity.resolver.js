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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAdminEntityResolver = exports.ProductEntityResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const utils_1 = require("../../../common/utils");
const product_entity_1 = require("../../../entity/product/product.entity");
const locale_string_hydrator_1 = require("../../../service/helpers/locale-string-hydrator/locale-string-hydrator");
const asset_service_1 = require("../../../service/services/asset.service");
const collection_service_1 = require("../../../service/services/collection.service");
const product_option_group_service_1 = require("../../../service/services/product-option-group.service");
const product_variant_service_1 = require("../../../service/services/product-variant.service");
const product_service_1 = require("../../../service/services/product.service");
const request_context_1 = require("../../common/request-context");
const api_decorator_1 = require("../../decorators/api.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
let ProductEntityResolver = class ProductEntityResolver {
    constructor(productVariantService, collectionService, productOptionGroupService, assetService, productService, localeStringHydrator) {
        this.productVariantService = productVariantService;
        this.collectionService = collectionService;
        this.productOptionGroupService = productOptionGroupService;
        this.assetService = assetService;
        this.productService = productService;
        this.localeStringHydrator = localeStringHydrator;
    }
    name(ctx, product) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, product, 'name');
    }
    slug(ctx, product) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, product, 'slug');
    }
    description(ctx, product) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, product, 'description');
    }
    async variants(ctx, product) {
        const { items: variants } = await this.productVariantService.getVariantsByProductId(ctx, product.id);
        return variants;
    }
    async variantList(ctx, product, args) {
        return this.productVariantService.getVariantsByProductId(ctx, product.id, args.options);
    }
    async collections(ctx, product, apiType) {
        return this.collectionService.getCollectionsByProductId(ctx, product.id, apiType === 'shop');
    }
    async optionGroups(info, ctx, product) {
        return this.productOptionGroupService.getOptionGroupsByProductId(ctx, product.id);
    }
    async facetValues(ctx, product) {
        var _a, _b, _c;
        if (((_a = product.facetValues) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            return [];
        }
        let facetValues;
        if ((_c = (_b = product.facetValues) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.channels) {
            facetValues = product.facetValues;
        }
        else {
            facetValues = await this.productService.getFacetValuesForProduct(ctx, product.id);
        }
        return facetValues.filter(fv => fv.channels.find(c => utils_1.idsAreEqual(c.id, ctx.channelId)));
    }
    async featuredAsset(ctx, product) {
        if (product.featuredAsset) {
            return product.featuredAsset;
        }
        return this.assetService.getFeaturedAsset(ctx, product);
    }
    async assets(ctx, product) {
        return this.assetService.getEntityAssets(ctx, product);
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "name", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "slug", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "description", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "variants", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __param(2, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        product_entity_1.Product, Object]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "variantList", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __param(2, api_decorator_1.Api()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        product_entity_1.Product, String]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "collections", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, graphql_1.Info()),
    __param(1, request_context_decorator_1.Ctx()),
    __param(2, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_context_1.RequestContext,
        product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "optionGroups", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "facetValues", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "featuredAsset", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductEntityResolver.prototype, "assets", null);
ProductEntityResolver = __decorate([
    graphql_1.Resolver('Product'),
    __metadata("design:paramtypes", [product_variant_service_1.ProductVariantService,
        collection_service_1.CollectionService,
        product_option_group_service_1.ProductOptionGroupService,
        asset_service_1.AssetService,
        product_service_1.ProductService,
        locale_string_hydrator_1.LocaleStringHydrator])
], ProductEntityResolver);
exports.ProductEntityResolver = ProductEntityResolver;
let ProductAdminEntityResolver = class ProductAdminEntityResolver {
    constructor(productService) {
        this.productService = productService;
    }
    async channels(ctx, product) {
        const isDefaultChannel = ctx.channel.code === shared_constants_1.DEFAULT_CHANNEL_CODE;
        const channels = product.channels || (await this.productService.getProductChannels(ctx, product.id));
        return channels.filter(channel => (isDefaultChannel ? true : utils_1.idsAreEqual(channel.id, ctx.channelId)));
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, product_entity_1.Product]),
    __metadata("design:returntype", Promise)
], ProductAdminEntityResolver.prototype, "channels", null);
ProductAdminEntityResolver = __decorate([
    graphql_1.Resolver('Product'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductAdminEntityResolver);
exports.ProductAdminEntityResolver = ProductAdminEntityResolver;
//# sourceMappingURL=product-entity.resolver.js.map