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
exports.CollectionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../../common/error/errors");
const collection_filter_1 = require("../../../config/catalog/collection-filter");
const collection_service_1 = require("../../../service/services/collection.service");
const facet_value_service_1 = require("../../../service/services/facet-value.service");
const configurable_operation_codec_1 = require("../../common/configurable-operation-codec");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let CollectionResolver = class CollectionResolver {
    constructor(collectionService, facetValueService, configurableOperationCodec) {
        this.collectionService = collectionService;
        this.facetValueService = facetValueService;
        this.configurableOperationCodec = configurableOperationCodec;
        /**
         * Encodes any entity IDs used in the filter arguments.
         */
        this.encodeFilters = (collection) => {
            if (collection) {
                this.configurableOperationCodec.encodeConfigurableOperationIds(collection_filter_1.CollectionFilter, collection.filters);
            }
            return collection;
        };
    }
    async collectionFilters(ctx, args) {
        return this.collectionService.getAvailableFilters(ctx);
    }
    async collections(ctx, args) {
        return this.collectionService.findAll(ctx, args.options || undefined).then(res => {
            res.items.forEach(this.encodeFilters);
            return res;
        });
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
        return this.encodeFilters(collection);
    }
    async createCollection(ctx, args) {
        const { input } = args;
        this.configurableOperationCodec.decodeConfigurableOperationIds(collection_filter_1.CollectionFilter, input.filters);
        return this.collectionService.create(ctx, input).then(this.encodeFilters);
    }
    async updateCollection(ctx, args) {
        const { input } = args;
        this.configurableOperationCodec.decodeConfigurableOperationIds(collection_filter_1.CollectionFilter, input.filters || []);
        return this.collectionService.update(ctx, input).then(this.encodeFilters);
    }
    async moveCollection(ctx, args) {
        const { input } = args;
        return this.collectionService.move(ctx, input).then(this.encodeFilters);
    }
    async deleteCollection(ctx, args) {
        return this.collectionService.delete(ctx, args.id);
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "collectionFilters", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "collections", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "collection", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.CreateCatalog, generated_types_1.Permission.CreateCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "createCollection", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "updateCollection", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateCatalog, generated_types_1.Permission.UpdateCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "moveCollection", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeleteCatalog, generated_types_1.Permission.DeleteCollection),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], CollectionResolver.prototype, "deleteCollection", null);
CollectionResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [collection_service_1.CollectionService,
        facet_value_service_1.FacetValueService,
        configurable_operation_codec_1.ConfigurableOperationCodec])
], CollectionResolver);
exports.CollectionResolver = CollectionResolver;
//# sourceMappingURL=collection.resolver.js.map