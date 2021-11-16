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
exports.ShopProductsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const errors_1 = require("../../../common/error/errors");
const service_1 = require("../../../service");
const facet_value_service_1 = require("../../../service/services/facet-value.service");
const product_variant_service_1 = require("../../../service/services/product-variant.service");
const product_service_1 = require("../../../service/services/product.service");
const request_context_1 = require("../../common/request-context");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
let ShopProductsResolver = class ShopProductsResolver {
    constructor(productService, productVariantService, facetValueService, collectionService, facetService) {
        this.productService = productService;
        this.productVariantService = productVariantService;
        this.facetValueService = facetValueService;
        this.collectionService = collectionService;
        this.facetService = facetService;
    }
    async products(ctx, args) {
        const options = Object.assign(Object.assign({}, args.options), { filter: Object.assign(Object.assign({}, (args.options && args.options.filter)), { enabled: { eq: true } }) });
        return this.productService.findAll(ctx, options);
    }
    async product(ctx, args) {
        let result;
        if (args.id) {
            result = await this.productService.findOne(ctx, args.id);
        }
        else if (args.slug) {
            result = await this.productService.findOneBySlug(ctx, args.slug);
        }
        else {
            throw new errors_1.UserInputError(`error.product-id-or-slug-must-be-provided`);
        }
        if (!result) {
            return;
        }
        if (result.enabled === false) {
            return;
        }
        result.facetValues = result.facetValues.filter(fv => !fv.facet.isPrivate);
        return result;
    }
    async collections(ctx, args) {
        const options = Object.assign(Object.assign({}, args.options), { filter: Object.assign(Object.assign({}, (args.options && args.options.filter)), { isPrivate: { eq: false } }) });
        return this.collectionService.findAll(ctx, options || undefined);
    }
    async collection(ctx, args) {
        let collection;
        if (args.id) {
            collection = await this.collectionService.findOne(ctx, args.id);
            if (args.slug && collection && collection.slug !== args.slug) {
                throw new errors_1.UserInputError(`error.collection-id-slug-mismatch`);
            }
        }
        else if (args.slug) {
            collection = await this.collectionService.findOneBySlug(ctx, args.slug);
        }
        else {
            throw new errors_1.UserInputError(`error.collection-id-or-slug-must-be-provided`);
        }
        if (collection && collection.isPrivate) {
            return;
        }
        return collection;
    }
    async search(...args) {
        throw new errors_1.InternalServerError(`error.no-search-plugin-configured`);
    }
    async facets(ctx, args) {
        const options = Object.assign(Object.assign({}, args.options), { filter: Object.assign(Object.assign({}, (args.options && args.options.filter)), { isPrivate: { eq: false } }) });
        return this.facetService.findAll(ctx, options || undefined);
    }
    async facet(ctx, args) {
        const facet = await this.facetService.findOne(ctx, args.id);
        if (facet && facet.isPrivate) {
            return;
        }
        return facet;
    }
};
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "products", null);
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "product", null);
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "collections", null);
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "collection", null);
__decorate([
    graphql_1.Query(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "search", null);
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "facets", null);
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopProductsResolver.prototype, "facet", null);
ShopProductsResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        product_variant_service_1.ProductVariantService,
        facet_value_service_1.FacetValueService,
        service_1.CollectionService,
        service_1.FacetService])
], ShopProductsResolver);
exports.ShopProductsResolver = ShopProductsResolver;
//# sourceMappingURL=shop-products.resolver.js.map