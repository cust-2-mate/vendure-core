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
exports.IndexerController = exports.workerLoggerCtx = exports.variantRelations = exports.BATCH_SIZE = void 0;
const common_1 = require("@nestjs/common");
const unique_1 = require("@vendure/common/lib/unique");
const FindOptionsUtils_1 = require("typeorm/find-options/FindOptionsUtils");
const request_context_1 = require("../../../api/common/request-context");
const async_queue_1 = require("../../../common/async-queue");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const vendure_logger_1 = require("../../../config/logger/vendure-logger");
const product_variant_entity_1 = require("../../../entity/product-variant/product-variant.entity");
const product_entity_1 = require("../../../entity/product/product.entity");
const product_variant_service_1 = require("../../../service/services/product-variant.service");
const transactional_connection_1 = require("../../../service/transaction/transactional-connection");
const search_index_item_entity_1 = require("../search-index-item.entity");
exports.BATCH_SIZE = 1000;
exports.variantRelations = [
    'product',
    'product.featuredAsset',
    'product.facetValues',
    'product.facetValues.facet',
    'product.channels',
    'featuredAsset',
    'facetValues',
    'facetValues.facet',
    'collections',
    'taxCategory',
    'channels',
    'channels.defaultTaxZone',
];
exports.workerLoggerCtx = 'DefaultSearchPlugin Worker';
let IndexerController = class IndexerController {
    constructor(connection, productVariantService, configService) {
        this.connection = connection;
        this.productVariantService = productVariantService;
        this.configService = configService;
        this.queue = new async_queue_1.AsyncQueue('search-index');
    }
    reindex({ ctx: rawContext }) {
        const ctx = request_context_1.RequestContext.deserialize(rawContext);
        return utils_1.asyncObservable(async (observer) => {
            const timeStart = Date.now();
            const qb = this.getSearchIndexQueryBuilder(ctx.channelId);
            const count = await qb.getCount();
            vendure_logger_1.Logger.verbose(`Reindexing ${count} variants for channel ${ctx.channel.code}`, exports.workerLoggerCtx);
            const batches = Math.ceil(count / exports.BATCH_SIZE);
            await this.connection
                .getRepository(search_index_item_entity_1.SearchIndexItem)
                .delete({ languageCode: ctx.languageCode, channelId: ctx.channelId });
            vendure_logger_1.Logger.verbose('Deleted existing index items', exports.workerLoggerCtx);
            for (let i = 0; i < batches; i++) {
                vendure_logger_1.Logger.verbose(`Processing batch ${i + 1} of ${batches}`, exports.workerLoggerCtx);
                const variants = await qb
                    .andWhere('variants__product.deletedAt IS NULL')
                    .take(exports.BATCH_SIZE)
                    .skip(i * exports.BATCH_SIZE)
                    .getMany();
                await this.saveVariants(variants);
                observer.next({
                    total: count,
                    completed: Math.min((i + 1) * exports.BATCH_SIZE, count),
                    duration: +new Date() - timeStart,
                });
            }
            vendure_logger_1.Logger.verbose(`Completed reindexing`, exports.workerLoggerCtx);
            return {
                total: count,
                completed: count,
                duration: +new Date() - timeStart,
            };
        });
    }
    updateVariantsById({ ctx: rawContext, ids, }) {
        const ctx = request_context_1.RequestContext.deserialize(rawContext);
        return utils_1.asyncObservable(async (observer) => {
            const timeStart = Date.now();
            if (ids.length) {
                const batches = Math.ceil(ids.length / exports.BATCH_SIZE);
                vendure_logger_1.Logger.verbose(`Updating ${ids.length} variants...`);
                for (let i = 0; i < batches; i++) {
                    const begin = i * exports.BATCH_SIZE;
                    const end = begin + exports.BATCH_SIZE;
                    vendure_logger_1.Logger.verbose(`Updating ids from index ${begin} to ${end}`);
                    const batchIds = ids.slice(begin, end);
                    const batch = await this.connection.getRepository(product_variant_entity_1.ProductVariant).findByIds(batchIds, {
                        relations: exports.variantRelations,
                        where: { deletedAt: null },
                    });
                    await this.saveVariants(batch);
                    observer.next({
                        total: ids.length,
                        completed: Math.min((i + 1) * exports.BATCH_SIZE, ids.length),
                        duration: +new Date() - timeStart,
                    });
                }
            }
            vendure_logger_1.Logger.verbose(`Completed reindexing!`);
            return {
                total: ids.length,
                completed: ids.length,
                duration: +new Date() - timeStart,
            };
        });
    }
    async updateProduct(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.updateProductInChannel(ctx, data.productId, ctx.channelId);
    }
    async updateVariants(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.updateVariantsInChannel(ctx, data.variantIds, ctx.channelId);
    }
    async deleteProduct(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.deleteProductInChannel(ctx, data.productId, ctx.channelId);
    }
    async deleteVariant(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        const variants = await this.connection.getRepository(product_variant_entity_1.ProductVariant).findByIds(data.variantIds);
        if (variants.length) {
            const languageVariants = unique_1.unique([
                ...variants
                    .reduce((vt, v) => [...vt, ...v.translations], [])
                    .map(t => t.languageCode),
            ]);
            await this.removeSearchIndexItems(ctx.channelId, variants.map(v => v.id), languageVariants);
        }
        return true;
    }
    async assignProductToChannel(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.updateProductInChannel(ctx, data.productId, data.channelId);
    }
    async removeProductFromChannel(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.deleteProductInChannel(ctx, data.productId, data.channelId);
    }
    async assignVariantToChannel(data) {
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        return this.updateVariantsInChannel(ctx, [data.productVariantId], data.channelId);
    }
    async removeVariantFromChannel(data) {
        var _a;
        const ctx = request_context_1.RequestContext.deserialize(data.ctx);
        const variant = await this.connection.getRepository(product_variant_entity_1.ProductVariant).findOne(data.productVariantId);
        const languageVariants = (_a = variant === null || variant === void 0 ? void 0 : variant.translations.map(t => t.languageCode)) !== null && _a !== void 0 ? _a : [];
        await this.removeSearchIndexItems(data.channelId, [data.productVariantId], languageVariants);
        return true;
    }
    async updateAsset(data) {
        const id = data.asset.id;
        function getFocalPoint(point) {
            return point && point.x && point.y ? point : null;
        }
        const focalPoint = getFocalPoint(data.asset.focalPoint);
        await this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .update({ productAssetId: id }, { productPreviewFocalPoint: focalPoint });
        await this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .update({ productVariantAssetId: id }, { productVariantPreviewFocalPoint: focalPoint });
        return true;
    }
    async deleteAsset(data) {
        const id = data.asset.id;
        await this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .update({ productAssetId: id }, { productAssetId: null });
        await this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .update({ productVariantAssetId: id }, { productVariantAssetId: null });
        return true;
    }
    async updateProductInChannel(ctx, productId, channelId) {
        const product = await this.connection.getRepository(product_entity_1.Product).findOne(productId, {
            relations: ['variants'],
        });
        if (product) {
            const updatedVariants = await this.connection.getRepository(product_variant_entity_1.ProductVariant).findByIds(product.variants.map(v => v.id), {
                relations: exports.variantRelations,
                where: { deletedAt: null },
            });
            if (updatedVariants.length === 0) {
                await this.saveSyntheticVariant(ctx, product);
            }
            else {
                if (product.enabled === false) {
                    updatedVariants.forEach(v => (v.enabled = false));
                }
                const variantsInCurrentChannel = updatedVariants.filter(v => !!v.channels.find(c => utils_1.idsAreEqual(c.id, ctx.channelId)));
                vendure_logger_1.Logger.verbose(`Updating ${variantsInCurrentChannel.length} variants`, exports.workerLoggerCtx);
                if (variantsInCurrentChannel.length) {
                    await this.saveVariants(variantsInCurrentChannel);
                }
            }
        }
        return true;
    }
    async updateVariantsInChannel(ctx, variantIds, channelId) {
        const variants = await this.connection.getRepository(product_variant_entity_1.ProductVariant).findByIds(variantIds, {
            relations: exports.variantRelations,
            where: { deletedAt: null },
        });
        if (variants) {
            vendure_logger_1.Logger.verbose(`Updating ${variants.length} variants`, exports.workerLoggerCtx);
            await this.saveVariants(variants);
        }
        return true;
    }
    async deleteProductInChannel(ctx, productId, channelId) {
        const product = await this.connection.getRepository(product_entity_1.Product).findOne(productId, {
            relations: ['variants'],
        });
        if (product) {
            const languageVariants = unique_1.unique([
                ...product.translations.map(t => t.languageCode),
                ...product.variants
                    .reduce((vt, v) => [...vt, ...v.translations], [])
                    .map(t => t.languageCode),
            ]);
            const removedVariantIds = product.variants.map(v => v.id);
            if (removedVariantIds.length) {
                await this.removeSearchIndexItems(channelId, removedVariantIds, languageVariants);
            }
        }
        return true;
    }
    getSearchIndexQueryBuilder(channelId) {
        const qb = this.connection.getRepository(product_variant_entity_1.ProductVariant).createQueryBuilder('variants');
        FindOptionsUtils_1.FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
            relations: exports.variantRelations,
        });
        FindOptionsUtils_1.FindOptionsUtils.joinEagerRelations(qb, qb.alias, this.connection.rawConnection.getMetadata(product_variant_entity_1.ProductVariant));
        qb.leftJoin('variants.product', 'product')
            .leftJoin('product.channels', 'channel')
            .where('channel.id = :channelId', { channelId })
            .andWhere('variants__product.deletedAt IS NULL')
            .andWhere('variants.deletedAt IS NULL');
        return qb;
    }
    async saveVariants(variants) {
        const items = [];
        await this.removeSyntheticVariants(variants);
        for (const variant of variants) {
            const languageVariants = unique_1.unique([
                ...variant.translations.map(t => t.languageCode),
                ...variant.product.translations.map(t => t.languageCode),
            ]);
            for (const languageCode of languageVariants) {
                const productTranslation = this.getTranslation(variant.product, languageCode);
                const variantTranslation = this.getTranslation(variant, languageCode);
                const collectionTranslations = variant.collections.map(c => this.getTranslation(c, languageCode));
                for (const channel of variant.channels) {
                    const ctx = new request_context_1.RequestContext({
                        channel,
                        apiType: 'admin',
                        authorizedAsOwnerOnly: false,
                        isAuthorized: true,
                        session: {},
                    });
                    await this.productVariantService.applyChannelPriceAndTax(variant, ctx);
                    items.push(new search_index_item_entity_1.SearchIndexItem({
                        channelId: channel.id,
                        languageCode,
                        productVariantId: variant.id,
                        price: variant.price,
                        priceWithTax: variant.priceWithTax,
                        sku: variant.sku,
                        enabled: variant.product.enabled === false ? false : variant.enabled,
                        slug: productTranslation.slug,
                        productId: variant.product.id,
                        productName: productTranslation.name,
                        description: this.constrainDescription(productTranslation.description),
                        productVariantName: variantTranslation.name,
                        productAssetId: variant.product.featuredAsset
                            ? variant.product.featuredAsset.id
                            : null,
                        productPreviewFocalPoint: variant.product.featuredAsset
                            ? variant.product.featuredAsset.focalPoint
                            : null,
                        productVariantPreviewFocalPoint: variant.featuredAsset
                            ? variant.featuredAsset.focalPoint
                            : null,
                        productVariantAssetId: variant.featuredAsset ? variant.featuredAsset.id : null,
                        productPreview: variant.product.featuredAsset
                            ? variant.product.featuredAsset.preview
                            : '',
                        productVariantPreview: variant.featuredAsset ? variant.featuredAsset.preview : '',
                        channelIds: variant.channels.map(c => c.id),
                        facetIds: this.getFacetIds(variant),
                        facetValueIds: this.getFacetValueIds(variant),
                        collectionIds: variant.collections.map(c => c.id.toString()),
                        collectionSlugs: collectionTranslations.map(c => c.slug),
                    }));
                }
            }
        }
        await this.queue.push(() => this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).save(items));
    }
    /**
     * If a Product has no variants, we create a synthetic variant for the purposes
     * of making that product visible via the search query.
     */
    async saveSyntheticVariant(ctx, product) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const productTranslation = this.getTranslation(product, ctx.languageCode);
        const item = new search_index_item_entity_1.SearchIndexItem({
            channelId: ctx.channelId,
            languageCode: ctx.languageCode,
            productVariantId: 0,
            price: 0,
            priceWithTax: 0,
            sku: '',
            enabled: false,
            slug: productTranslation.slug,
            productId: product.id,
            productName: productTranslation.name,
            description: this.constrainDescription(productTranslation.description),
            productVariantName: productTranslation.name,
            productAssetId: (_b = (_a = product.featuredAsset) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            productPreviewFocalPoint: (_d = (_c = product.featuredAsset) === null || _c === void 0 ? void 0 : _c.focalPoint) !== null && _d !== void 0 ? _d : null,
            productVariantPreviewFocalPoint: null,
            productVariantAssetId: null,
            productPreview: (_f = (_e = product.featuredAsset) === null || _e === void 0 ? void 0 : _e.preview) !== null && _f !== void 0 ? _f : '',
            productVariantPreview: '',
            channelIds: [ctx.channelId.toString()],
            facetIds: (_h = (_g = product.facetValues) === null || _g === void 0 ? void 0 : _g.map(fv => fv.facet.id.toString())) !== null && _h !== void 0 ? _h : [],
            facetValueIds: (_k = (_j = product.facetValues) === null || _j === void 0 ? void 0 : _j.map(fv => fv.id.toString())) !== null && _k !== void 0 ? _k : [],
            collectionIds: [],
            collectionSlugs: [],
        });
        await this.queue.push(() => this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).save(item));
    }
    /**
     * Removes any synthetic variants for the given product
     */
    async removeSyntheticVariants(variants) {
        const prodIds = unique_1.unique(variants.map(v => v.productId));
        for (const productId of prodIds) {
            await this.queue.push(() => this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).delete({
                productId,
                sku: '',
                price: 0,
            }));
        }
    }
    getTranslation(translatable, languageCode) {
        return (translatable.translations.find(t => t.languageCode === languageCode) ||
            translatable.translations.find(t => t.languageCode === this.configService.defaultLanguageCode) ||
            translatable.translations[0]);
    }
    getFacetIds(variant) {
        const facetIds = (fv) => fv.facet.id.toString();
        const variantFacetIds = variant.facetValues.map(facetIds);
        const productFacetIds = variant.product.facetValues.map(facetIds);
        return unique_1.unique([...variantFacetIds, ...productFacetIds]);
    }
    getFacetValueIds(variant) {
        const facetValueIds = (fv) => fv.id.toString();
        const variantFacetValueIds = variant.facetValues.map(facetValueIds);
        const productFacetValueIds = variant.product.facetValues.map(facetValueIds);
        return unique_1.unique([...variantFacetValueIds, ...productFacetValueIds]);
    }
    /**
     * Remove items from the search index
     */
    async removeSearchIndexItems(channelId, variantIds, languageCodes) {
        const keys = [];
        for (const productVariantId of variantIds) {
            for (const languageCode of languageCodes) {
                keys.push({
                    productVariantId,
                    channelId,
                    languageCode,
                });
            }
        }
        await this.queue.push(() => this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).delete(keys));
    }
    /**
     * Prevent postgres errors from too-long indices
     * https://github.com/vendure-ecommerce/vendure/issues/745
     */
    constrainDescription(description) {
        const { type } = this.connection.rawConnection.options;
        const isPostgresLike = type === 'postgres' || type === 'aurora-data-api-pg' || type === 'cockroachdb';
        if (isPostgresLike) {
            return description.substring(0, 2600);
        }
        return description;
    }
};
IndexerController = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        product_variant_service_1.ProductVariantService,
        config_service_1.ConfigService])
], IndexerController);
exports.IndexerController = IndexerController;
//# sourceMappingURL=indexer.controller.js.map