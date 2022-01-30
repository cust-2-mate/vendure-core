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
exports.CollectionEntityResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const entity_1 = require("../../../entity");
const locale_string_hydrator_1 = require("../../../service/helpers/locale-string-hydrator/locale-string-hydrator");
const asset_service_1 = require("../../../service/services/asset.service");
const collection_service_1 = require("../../../service/services/collection.service");
const product_variant_service_1 = require("../../../service/services/product-variant.service");
const request_context_1 = require("../../common/request-context");
const api_decorator_1 = require("../../decorators/api.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
let CollectionEntityResolver = class CollectionEntityResolver {
    constructor(productVariantService, collectionService, assetService, localeStringHydrator) {
        this.productVariantService = productVariantService;
        this.collectionService = collectionService;
        this.assetService = assetService;
        this.localeStringHydrator = localeStringHydrator;
    }
    name(ctx, collection) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, collection, 'name');
    }
    slug(ctx, collection) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, collection, 'slug');
    }
    description(ctx, collection) {
        return this.localeStringHydrator.hydrateLocaleStringField(ctx, collection, 'description');
    }
    async productVariants(ctx, collection, args, apiType) {
        let options = args.options;
        if (apiType === 'shop') {
            options = Object.assign(Object.assign({}, args.options), { filter: Object.assign(Object.assign({}, (args.options ? args.options.filter : {})), { enabled: { eq: true } }) });
        }
        return this.productVariantService.getVariantsByCollectionId(ctx, collection.id, options);
    }
    async breadcrumbs(ctx, collection) {
        return this.collectionService.getBreadcrumbs(ctx, collection);
    }
    async parent(ctx, collection, apiType) {
        let parent;
        if (collection.parent) {
            parent = collection.parent;
        }
        else {
            parent = await this.collectionService.getParent(ctx, collection.id);
        }
        return apiType === 'shop' && (parent === null || parent === void 0 ? void 0 : parent.isPrivate) ? undefined : parent;
    }
    async children(ctx, collection, apiType) {
        let children = [];
        if (collection.children) {
            children = collection.children;
        }
        else {
            children = (await this.collectionService.getChildren(ctx, collection.id));
        }
        return children.filter(c => (apiType === 'shop' ? !c.isPrivate : true));
    }
    async featuredAsset(ctx, collection) {
        if (collection.featuredAsset) {
            return collection.featuredAsset;
        }
        return this.assetService.getFeaturedAsset(ctx, collection);
    }
    async assets(ctx, collection) {
        return this.assetService.getEntityAssets(ctx, collection);
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "name", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "slug", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "description", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __param(2, graphql_1.Args()),
    __param(3, api_decorator_1.Api()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        entity_1.Collection, Object, String]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "productVariants", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "breadcrumbs", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __param(2, api_decorator_1.Api()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        entity_1.Collection, String]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "parent", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __param(2, api_decorator_1.Api()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        entity_1.Collection, String]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "children", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext,
        entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "featuredAsset", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, entity_1.Collection]),
    __metadata("design:returntype", Promise)
], CollectionEntityResolver.prototype, "assets", null);
CollectionEntityResolver = __decorate([
    graphql_1.Resolver('Collection'),
    __metadata("design:paramtypes", [product_variant_service_1.ProductVariantService,
        collection_service_1.CollectionService,
        asset_service_1.AssetService,
        locale_string_hydrator_1.LocaleStringHydrator])
], CollectionEntityResolver);
exports.CollectionEntityResolver = CollectionEntityResolver;
//# sourceMappingURL=collection-entity.resolver.js.map