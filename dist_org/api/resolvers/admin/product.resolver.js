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
exports.ProductResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../../common/error/errors");
const facet_value_service_1 = require("../../../service/services/facet-value.service");
const product_variant_service_1 = require("../../../service/services/product-variant.service");
const product_service_1 = require("../../../service/services/product.service");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let ProductResolver = class ProductResolver {
    constructor(productService, productVariantService, facetValueService) {
        this.productService = productService;
        this.productVariantService = productVariantService;
        this.facetValueService = facetValueService;
    }
    async products(ctx, args) {
        return this.productService.findAll(ctx, args.options || undefined);
    }
    async product(ctx, args) {
        if (args.id) {
            const product = await this.productService.findOne(ctx, args.id);
            if (args.slug && product && product.slug !== args.slug) {
                throw new errors_1.UserInputError(`error.product-id-slug-mismatch`);
            }
            return product;
        }
        else if (args.slug) {
            return this.productService.findOneBySlug(ctx, args.slug);
        }
        else {
            throw new errors_1.UserInputError(`error.product-id-or-slug-must-be-provided`);
        }
    }
    async productVariants(ctx, args) {
        if (args.productId) {
            return this.productVariantService.getVariantsByProductId(ctx, args.productId, args.options || undefined);
        }
        return this.productVariantService.findAll(ctx, args.options || undefined);
    }
    async productVariant(ctx, args) {
        return this.productVariantService.findOne(ctx, args.id);
    }
    async createProduct(ctx, args) {
        const { input } = args;
        return this.productService.create(ctx, input);
    }
    async updateProduct(ctx, args) {
        const { input } = args;
        return await this.productService.update(ctx, input);
    }
    async deleteProduct(ctx, args) {
        return this.productService.softDelete(ctx, args.id);
    }
    async addOptionGroupToProduct(ctx, args) {
        const { productId, optionGroupId } = args;
        return this.productService.addOptionGroupToProduct(ctx, productId, optionGroupId);
    }
    async removeOptionGroupFromProduct(ctx, args) {
        const { productId, optionGroupId } = args;
        return this.productService.removeOptionGroupFromProduct(ctx, productId, optionGroupId);
    }
    async createProductVariants(ctx, args) {
        const { input } = args;
        return this.productVariantService.create(ctx, input);
    }
    async updateProductVariants(ctx, args) {
        const { input } = args;
        return this.productVariantService.update(ctx, input);
    }
    async deleteProductVariant(ctx, args) {
        return this.productVariantService.softDelete(ctx, args.id);
    }
    async assignProductsToChannel(ctx, args) {
        return this.productService.assignProductsToChannel(ctx, args.input);
    }
    async removeProductsFromChannel(ctx, args) {
        return this.productService.removeProductsFromChannel(ctx, args.input);
    }
    async assignProductVariantsToChannel(ctx, args) {
        return this.productVariantService.assignProductVariantsToChannel(ctx, args.input);
    }
    async removeProductVariantsFromChannel(ctx, args) {
        return this.productVariantService.removeProductVariantsFromChannel(ctx, args.input);
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "products", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "product", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productVariants", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "productVariant", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.CreateCatalog, generated_types_1.Permission.CreateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "createProduct", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProduct", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeleteCatalog, generated_types_1.Permission.DeleteProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProduct", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "addOptionGroupToProduct", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "removeOptionGroupFromProduct", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "createProductVariants", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "updateProductVariants", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeleteCatalog, generated_types_1.Permission.DeleteProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "deleteProductVariant", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "assignProductsToChannel", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "removeProductsFromChannel", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "assignProductVariantsToChannel", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateProduct),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ProductResolver.prototype, "removeProductVariantsFromChannel", null);
ProductResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        product_variant_service_1.ProductVariantService,
        facet_value_service_1.FacetValueService])
], ProductResolver);
exports.ProductResolver = ProductResolver;
//# sourceMappingURL=product.resolver.js.map