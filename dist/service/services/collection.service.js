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
exports.CollectionService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const pick_1 = require("@vendure/common/lib/pick");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const request_context_1 = require("../../api/common/request-context");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const vendure_logger_1 = require("../../config/logger/vendure-logger");
const transactional_connection_1 = require("../../connection/transactional-connection");
const collection_translation_entity_1 = require("../../entity/collection/collection-translation.entity");
const collection_entity_1 = require("../../entity/collection/collection.entity");
const product_variant_entity_1 = require("../../entity/product-variant/product-variant.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const collection_event_1 = require("../../event-bus/events/collection-event");
const collection_modification_event_1 = require("../../event-bus/events/collection-modification-event");
const product_event_1 = require("../../event-bus/events/product-event");
const product_variant_event_1 = require("../../event-bus/events/product-variant-event");
const job_queue_service_1 = require("../../job-queue/job-queue.service");
const config_arg_service_1 = require("../helpers/config-arg/config-arg.service");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const slug_validator_1 = require("../helpers/slug-validator/slug-validator");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const move_to_index_1 = require("../helpers/utils/move-to-index");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const asset_service_1 = require("./asset.service");
const channel_service_1 = require("./channel.service");
const facet_value_service_1 = require("./facet-value.service");
/**
 * @description
 * Contains methods relating to {@link Collection} entities.
 *
 * @docsCategory services
 */
let CollectionService = class CollectionService {
    constructor(connection, channelService, assetService, facetValueService, listQueryBuilder, translatableSaver, eventBus, jobQueueService, configService, slugValidator, configArgService, customFieldRelationService) {
        this.connection = connection;
        this.channelService = channelService;
        this.assetService = assetService;
        this.facetValueService = facetValueService;
        this.listQueryBuilder = listQueryBuilder;
        this.translatableSaver = translatableSaver;
        this.eventBus = eventBus;
        this.jobQueueService = jobQueueService;
        this.configService = configService;
        this.slugValidator = slugValidator;
        this.configArgService = configArgService;
        this.customFieldRelationService = customFieldRelationService;
    }
    /**
     * @internal
     */
    async onModuleInit() {
        const productEvents$ = this.eventBus.ofType(product_event_1.ProductEvent);
        const variantEvents$ = this.eventBus.ofType(product_variant_event_1.ProductVariantEvent);
        rxjs_1.merge(productEvents$, variantEvents$)
            .pipe(operators_1.debounceTime(50))
            .subscribe(async (event) => {
            const collections = await this.connection.getRepository(collection_entity_1.Collection).find();
            await this.applyFiltersQueue.add({
                ctx: event.ctx.serialize(),
                collectionIds: collections.map(c => c.id),
            });
        });
        this.applyFiltersQueue = await this.jobQueueService.createQueue({
            name: 'apply-collection-filters',
            process: async (job) => {
                const ctx = request_context_1.RequestContext.deserialize(job.data.ctx);
                vendure_logger_1.Logger.verbose(`Processing ${job.data.collectionIds.length} Collections`);
                let completed = 0;
                for (const collectionId of job.data.collectionIds) {
                    let collection;
                    try {
                        collection = await this.connection.getEntityOrThrow(ctx, collection_entity_1.Collection, collectionId, {
                            retries: 5,
                            retryDelay: 50,
                        });
                    }
                    catch (err) {
                        vendure_logger_1.Logger.warn(`Could not find Collection with id ${collectionId}, skipping`);
                    }
                    completed++;
                    if (collection) {
                        const affectedVariantIds = await this.applyCollectionFiltersInternal(collection, job.data.applyToChangedVariantsOnly);
                        job.setProgress(Math.ceil((completed / job.data.collectionIds.length) * 100));
                        this.eventBus.publish(new collection_modification_event_1.CollectionModificationEvent(ctx, collection, affectedVariantIds));
                    }
                }
            },
        });
    }
    async findAll(ctx, options) {
        const relations = ['featuredAsset', 'parent', 'channels'];
        return this.listQueryBuilder
            .build(collection_entity_1.Collection, options, {
            relations,
            channelId: ctx.channelId,
            where: { isRoot: false },
            orderBy: { position: 'ASC' },
            ctx,
        })
            .getManyAndCount()
            .then(async ([collections, totalItems]) => {
            const items = collections.map(collection => translate_entity_1.translateDeep(collection, ctx.languageCode, ['parent']));
            return {
                items,
                totalItems,
            };
        });
    }
    async findOne(ctx, collectionId) {
        const relations = ['featuredAsset', 'assets', 'channels', 'parent'];
        const collection = await this.connection.findOneInChannel(ctx, collection_entity_1.Collection, collectionId, ctx.channelId, {
            relations,
            loadEagerRelations: true,
        });
        if (!collection) {
            return;
        }
        return translate_entity_1.translateDeep(collection, ctx.languageCode, ['parent']);
    }
    async findByIds(ctx, ids) {
        const relations = ['featuredAsset', 'assets', 'channels', 'parent'];
        const collections = this.connection.findByIdsInChannel(ctx, collection_entity_1.Collection, ids, ctx.channelId, {
            relations,
            loadEagerRelations: true,
        });
        return collections.then(values => values.map(collection => translate_entity_1.translateDeep(collection, ctx.languageCode, ['parent'])));
    }
    async findOneBySlug(ctx, slug) {
        var _a, _b;
        const translations = await this.connection.getRepository(ctx, collection_translation_entity_1.CollectionTranslation).find({
            relations: ['base'],
            where: { slug },
        });
        if (!(translations === null || translations === void 0 ? void 0 : translations.length)) {
            return;
        }
        const bestMatch = (_b = (_a = translations.find(t => t.languageCode === ctx.languageCode)) !== null && _a !== void 0 ? _a : translations.find(t => t.languageCode === ctx.channel.defaultLanguageCode)) !== null && _b !== void 0 ? _b : translations[0];
        return this.findOne(ctx, bestMatch.base.id);
    }
    /**
     * @description
     * Returns all configured CollectionFilters, as specified by the {@link CatalogOptions}.
     */
    getAvailableFilters(ctx) {
        return this.configService.catalogOptions.collectionFilters.map(f => f.toGraphQlType(ctx));
    }
    async getParent(ctx, collectionId) {
        const parentIdSelect = this.connection.rawConnection.options.type === 'postgres'
            ? '"child"."parentId"'
            : 'child.parentId';
        const parent = await this.connection
            .getRepository(ctx, collection_entity_1.Collection)
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.translations', 'translation')
            .where(qb => `collection.id = ${qb
            .subQuery()
            .select(parentIdSelect)
            .from(collection_entity_1.Collection, 'child')
            .where('child.id = :id', { id: collectionId })
            .getQuery()}`)
            .getOne();
        return parent && translate_entity_1.translateDeep(parent, ctx.languageCode);
    }
    /**
     * @description
     * Returns all child Collections of the Collection with the given id.
     */
    async getChildren(ctx, collectionId) {
        return this.getDescendants(ctx, collectionId, 1);
    }
    /**
     * @description
     * Returns an array of name/id pairs representing all ancestor Collections up
     * to the Root Collection.
     */
    async getBreadcrumbs(ctx, collection) {
        const rootCollection = await this.getRootCollection(ctx);
        if (utils_1.idsAreEqual(collection.id, rootCollection.id)) {
            return [pick_1.pick(rootCollection, ['id', 'name', 'slug'])];
        }
        const pickProps = pick_1.pick(['id', 'name', 'slug']);
        const ancestors = await this.getAncestors(collection.id, ctx);
        return [pickProps(rootCollection), ...ancestors.map(pickProps).reverse(), pickProps(collection)];
    }
    /**
     * @description
     * Returns all Collections which are associated with the given Product ID.
     */
    async getCollectionsByProductId(ctx, productId, publicOnly) {
        const qb = this.connection
            .getRepository(ctx, collection_entity_1.Collection)
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.translations', 'translation')
            .leftJoin('collection.productVariants', 'variant')
            .where('variant.product = :productId', { productId })
            .groupBy('collection.id, translation.id')
            .orderBy('collection.id', 'ASC');
        if (publicOnly) {
            qb.andWhere('collection.isPrivate = :isPrivate', { isPrivate: false });
        }
        const result = await qb.getMany();
        return result.map(collection => translate_entity_1.translateDeep(collection, ctx.languageCode));
    }
    /**
     * @description
     * Returns the descendants of a Collection as a flat array. The depth of the traversal can be limited
     * with the maxDepth argument. So to get only the immediate children, set maxDepth = 1.
     */
    async getDescendants(ctx, rootId, maxDepth = Number.MAX_SAFE_INTEGER) {
        const getChildren = async (id, _descendants = [], depth = 1) => {
            const children = await this.connection
                .getRepository(ctx, collection_entity_1.Collection)
                .find({ where: { parent: { id } }, order: { position: 'ASC' } });
            for (const child of children) {
                _descendants.push(child);
                if (depth < maxDepth) {
                    await getChildren(child.id, _descendants, depth++);
                }
            }
            return _descendants;
        };
        const descendants = await getChildren(rootId);
        return descendants.map(c => translate_entity_1.translateDeep(c, ctx.languageCode));
    }
    async getAncestors(collectionId, ctx) {
        const getParent = async (id, _ancestors = []) => {
            const parent = await this.connection
                .getRepository(ctx, collection_entity_1.Collection)
                .createQueryBuilder()
                .relation(collection_entity_1.Collection, 'parent')
                .of(id)
                .loadOne();
            if (parent) {
                if (!parent.isRoot) {
                    _ancestors.push(parent);
                    return getParent(parent.id, _ancestors);
                }
            }
            return _ancestors;
        };
        const ancestors = await getParent(collectionId);
        return this.connection
            .getRepository(collection_entity_1.Collection)
            .findByIds(ancestors.map(c => c.id))
            .then(categories => {
            const resultCategories = [];
            ancestors.forEach(a => {
                const category = categories.find(c => c.id === a.id);
                if (category) {
                    resultCategories.push(ctx ? translate_entity_1.translateDeep(category, ctx.languageCode) : category);
                }
            });
            return resultCategories;
        });
    }
    async create(ctx, input) {
        await this.slugValidator.validateSlugs(ctx, input, collection_translation_entity_1.CollectionTranslation);
        const collection = await this.translatableSaver.create({
            ctx,
            input,
            entityType: collection_entity_1.Collection,
            translationType: collection_translation_entity_1.CollectionTranslation,
            beforeSave: async (coll) => {
                await this.channelService.assignToCurrentChannel(coll, ctx);
                const parent = await this.getParentCollection(ctx, input.parentId);
                if (parent) {
                    coll.parent = parent;
                }
                coll.position = await this.getNextPositionInParent(ctx, input.parentId || undefined);
                coll.filters = this.getCollectionFiltersFromInput(input);
                await this.assetService.updateFeaturedAsset(ctx, coll, input);
            },
        });
        await this.assetService.updateEntityAssets(ctx, collection, input);
        const collectionWithRelations = await this.customFieldRelationService.updateRelations(ctx, collection_entity_1.Collection, input, collection);
        await this.applyFiltersQueue.add({
            ctx: ctx.serialize(),
            collectionIds: [collection.id],
        });
        this.eventBus.publish(new collection_event_1.CollectionEvent(ctx, collectionWithRelations, 'created', input));
        return utils_1.assertFound(this.findOne(ctx, collection.id));
    }
    async update(ctx, input) {
        await this.slugValidator.validateSlugs(ctx, input, collection_translation_entity_1.CollectionTranslation);
        const collection = await this.translatableSaver.update({
            ctx,
            input,
            entityType: collection_entity_1.Collection,
            translationType: collection_translation_entity_1.CollectionTranslation,
            beforeSave: async (coll) => {
                if (input.filters) {
                    coll.filters = this.getCollectionFiltersFromInput(input);
                }
                await this.assetService.updateFeaturedAsset(ctx, coll, input);
                await this.assetService.updateEntityAssets(ctx, coll, input);
            },
        });
        await this.customFieldRelationService.updateRelations(ctx, collection_entity_1.Collection, input, collection);
        if (input.filters) {
            await this.applyFiltersQueue.add({
                ctx: ctx.serialize(),
                collectionIds: [collection.id],
                applyToChangedVariantsOnly: false,
            });
        }
        else {
            const affectedVariantIds = await this.getCollectionProductVariantIds(collection);
            this.eventBus.publish(new collection_modification_event_1.CollectionModificationEvent(ctx, collection, affectedVariantIds));
        }
        this.eventBus.publish(new collection_event_1.CollectionEvent(ctx, collection, 'updated', input));
        return utils_1.assertFound(this.findOne(ctx, collection.id));
    }
    async delete(ctx, id) {
        const collection = await this.connection.getEntityOrThrow(ctx, collection_entity_1.Collection, id, {
            channelId: ctx.channelId,
        });
        const descendants = await this.getDescendants(ctx, collection.id);
        for (const coll of [...descendants.reverse(), collection]) {
            const affectedVariantIds = await this.getCollectionProductVariantIds(coll);
            await this.connection.getRepository(ctx, collection_entity_1.Collection).remove(coll);
            this.eventBus.publish(new collection_modification_event_1.CollectionModificationEvent(ctx, coll, affectedVariantIds));
        }
        this.eventBus.publish(new collection_event_1.CollectionEvent(ctx, collection, 'deleted', id));
        return {
            result: generated_types_1.DeletionResult.DELETED,
        };
    }
    /**
     * @description
     * Moves a Collection by specifying the parent Collection ID, and an index representing the order amongst
     * its siblings.
     */
    async move(ctx, input) {
        const target = await this.connection.getEntityOrThrow(ctx, collection_entity_1.Collection, input.collectionId, {
            channelId: ctx.channelId,
            relations: ['parent'],
        });
        const descendants = await this.getDescendants(ctx, input.collectionId);
        if (utils_1.idsAreEqual(input.parentId, target.id) ||
            descendants.some(cat => utils_1.idsAreEqual(input.parentId, cat.id))) {
            throw new errors_1.IllegalOperationError(`error.cannot-move-collection-into-self`);
        }
        let siblings = await this.connection
            .getRepository(ctx, collection_entity_1.Collection)
            .createQueryBuilder('collection')
            .leftJoin('collection.parent', 'parent')
            .where('parent.id = :id', { id: input.parentId })
            .getMany();
        if (!utils_1.idsAreEqual(target.parent.id, input.parentId)) {
            target.parent = new collection_entity_1.Collection({ id: input.parentId });
        }
        siblings = move_to_index_1.moveToIndex(input.index, target, siblings);
        await this.connection.getRepository(ctx, collection_entity_1.Collection).save(siblings);
        await this.applyFiltersQueue.add({
            ctx: ctx.serialize(),
            collectionIds: [target.id],
        });
        return utils_1.assertFound(this.findOne(ctx, input.collectionId));
    }
    getCollectionFiltersFromInput(input) {
        const filters = [];
        if (input.filters) {
            for (const filter of input.filters) {
                filters.push(this.configArgService.parseInput('CollectionFilter', filter));
            }
        }
        return filters;
    }
    /**
     * Applies the CollectionFilters
     *
     * If applyToChangedVariantsOnly (default: true) is true, then apply collection job will process only changed variants
     * If applyToChangedVariantsOnly (default: true) is false, then apply collection job will process all variants
     * This param is used when we update collection and collection filters are changed to update all
     * variants (because other attributes of collection can be changed https://github.com/vendure-ecommerce/vendure/issues/1015)
     */
    async applyCollectionFiltersInternal(collection, applyToChangedVariantsOnly = true) {
        const ancestorFilters = await this.getAncestors(collection.id).then(ancestors => ancestors.reduce((filters, c) => [...filters, ...(c.filters || [])], []));
        const preIds = await this.getCollectionProductVariantIds(collection);
        collection.productVariants = await this.getFilteredProductVariants([
            ...ancestorFilters,
            ...(collection.filters || []),
        ]);
        const postIds = collection.productVariants.map(v => v.id);
        try {
            await this.connection
                .getRepository(collection_entity_1.Collection)
                // Only update the exact changed properties, to avoid VERY hard-to-debug
                // non-deterministic race conditions e.g. when the "position" is changed
                // by moving a Collection and then this save operation clobbers it back
                // to the old value.
                .save(pick_1.pick(collection, ['id', 'productVariants']), {
                chunk: Math.ceil(collection.productVariants.length / 500),
                reload: false,
            });
        }
        catch (e) {
            vendure_logger_1.Logger.error(e);
        }
        const preIdsSet = new Set(preIds);
        const postIdsSet = new Set(postIds);
        if (applyToChangedVariantsOnly) {
            return [...preIds.filter(id => !postIdsSet.has(id)), ...postIds.filter(id => !preIdsSet.has(id))];
        }
        else {
            return [...preIds.filter(id => !postIdsSet.has(id)), ...postIds];
        }
    }
    /**
     * Applies the CollectionFilters and returns an array of ProductVariant entities which match.
     */
    async getFilteredProductVariants(filters) {
        if (filters.length === 0) {
            return [];
        }
        const { collectionFilters } = this.configService.catalogOptions;
        let qb = this.connection.getRepository(product_variant_entity_1.ProductVariant).createQueryBuilder('productVariant');
        for (const filterType of collectionFilters) {
            const filtersOfType = filters.filter(f => f.code === filterType.code);
            if (filtersOfType.length) {
                for (const filter of filtersOfType) {
                    qb = filterType.apply(qb, filter.args);
                }
            }
        }
        return qb.getMany();
    }
    /**
     * Returns the IDs of the Collection's ProductVariants.
     */
    async getCollectionProductVariantIds(collection, ctx) {
        if (collection.productVariants) {
            return collection.productVariants.map(v => v.id);
        }
        else {
            const productVariants = await this.connection
                .getRepository(ctx, product_variant_entity_1.ProductVariant)
                .createQueryBuilder('variant')
                .select('variant.id', 'id')
                .innerJoin('variant.collections', 'collection', 'collection.id = :id', { id: collection.id })
                .getRawMany();
            return productVariants.map(v => v.id);
        }
    }
    /**
     * Returns the next position value in the given parent collection.
     */
    async getNextPositionInParent(ctx, maybeParentId) {
        const parentId = maybeParentId || (await this.getRootCollection(ctx)).id;
        const result = await this.connection
            .getRepository(ctx, collection_entity_1.Collection)
            .createQueryBuilder('collection')
            .leftJoin('collection.parent', 'parent')
            .select('MAX(collection.position)', 'index')
            .where('parent.id = :id', { id: parentId })
            .getRawOne();
        return (result.index || 0) + 1;
    }
    async getParentCollection(ctx, parentId) {
        if (parentId) {
            return this.connection
                .getRepository(ctx, collection_entity_1.Collection)
                .createQueryBuilder('collection')
                .leftJoin('collection.channels', 'channel')
                .where('collection.id = :id', { id: parentId })
                .andWhere('channel.id = :channelId', { channelId: ctx.channelId })
                .getOne();
        }
        else {
            return this.getRootCollection(ctx);
        }
    }
    async getRootCollection(ctx) {
        const cachedRoot = this.rootCollection;
        if (cachedRoot) {
            return cachedRoot;
        }
        const existingRoot = await this.connection
            .getRepository(ctx, collection_entity_1.Collection)
            .createQueryBuilder('collection')
            .leftJoin('collection.channels', 'channel')
            .leftJoinAndSelect('collection.translations', 'translation')
            .where('collection.isRoot = :isRoot', { isRoot: true })
            .andWhere('channel.id = :channelId', { channelId: ctx.channelId })
            .getOne();
        if (existingRoot) {
            this.rootCollection = translate_entity_1.translateDeep(existingRoot, ctx.languageCode);
            return this.rootCollection;
        }
        // We purposefully do not use the ctx in saving the new root Collection
        // so that even if the outer transaction fails, the root collection will still
        // get persisted.
        const rootTranslation = await this.connection.getRepository(collection_translation_entity_1.CollectionTranslation).save(new collection_translation_entity_1.CollectionTranslation({
            languageCode: this.configService.defaultLanguageCode,
            name: shared_constants_1.ROOT_COLLECTION_NAME,
            description: 'The root of the Collection tree.',
            slug: shared_constants_1.ROOT_COLLECTION_NAME,
        }));
        const newRoot = await this.connection.getRepository(collection_entity_1.Collection).save(new collection_entity_1.Collection({
            isRoot: true,
            position: 0,
            translations: [rootTranslation],
            channels: [ctx.channel],
            filters: [],
        }));
        this.rootCollection = translate_entity_1.translateDeep(newRoot, ctx.languageCode);
        return this.rootCollection;
    }
};
CollectionService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        channel_service_1.ChannelService,
        asset_service_1.AssetService,
        facet_value_service_1.FacetValueService,
        list_query_builder_1.ListQueryBuilder,
        translatable_saver_1.TranslatableSaver,
        event_bus_1.EventBus,
        job_queue_service_1.JobQueueService,
        config_service_1.ConfigService,
        slug_validator_1.SlugValidator,
        config_arg_service_1.ConfigArgService,
        custom_field_relation_service_1.CustomFieldRelationService])
], CollectionService);
exports.CollectionService = CollectionService;
//# sourceMappingURL=collection.service.js.map