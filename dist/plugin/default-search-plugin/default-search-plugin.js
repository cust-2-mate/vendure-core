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
var DefaultSearchPlugin_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSearchPlugin = void 0;
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const utils_1 = require("../../common/utils");
const event_bus_1 = require("../../event-bus/event-bus");
const asset_event_1 = require("../../event-bus/events/asset-event");
const collection_modification_event_1 = require("../../event-bus/events/collection-modification-event");
const product_channel_event_1 = require("../../event-bus/events/product-channel-event");
const product_event_1 = require("../../event-bus/events/product-event");
const product_variant_channel_event_1 = require("../../event-bus/events/product-variant-channel-event");
const product_variant_event_1 = require("../../event-bus/events/product-variant-event");
const tax_rate_modification_event_1 = require("../../event-bus/events/tax-rate-modification-event");
const job_queue_service_1 = require("../../job-queue/job-queue.service");
const plugin_common_module_1 = require("../plugin-common.module");
const vendure_plugin_1 = require("../vendure-plugin");
const api_extensions_1 = require("./api/api-extensions");
const fulltext_search_resolver_1 = require("./api/fulltext-search.resolver");
const constants_1 = require("./constants");
const search_index_item_entity_1 = require("./entities/search-index-item.entity");
const fulltext_search_service_1 = require("./fulltext-search.service");
const indexer_controller_1 = require("./indexer/indexer.controller");
const search_index_service_1 = require("./indexer/search-index.service");
const search_job_buffer_service_1 = require("./search-job-buffer/search-job-buffer.service");
/**
 * @description
 * The DefaultSearchPlugin provides a full-text Product search based on the full-text searching capabilities of the
 * underlying database.
 *
 * The DefaultSearchPlugin is bundled with the `\@vendure/core` package. If you are not using an alternative search
 * plugin, then make sure this one is used, otherwise you will not be able to search products via the
 * [`search` query](/docs/graphql-api/shop/queries#search).
 *
 * {{% alert "warning" %}}
 * Note that the quality of the fulltext search capabilities varies depending on the underlying database being used. For example,
 * the MySQL & Postgres implementations will typically yield better results than the SQLite implementation.
 * {{% /alert %}}
 *
 *
 * @example
 * ```ts
 * import { DefaultSearchPlugin, VendureConfig } from '\@vendure/core';
 *
 * export const config: VendureConfig = {
 *   // Add an instance of the plugin to the plugins array
 *   plugins: [
 *     DefaultSearchPlugin.init({
 *       indexStockStatus: true,
 *       bufferUpdates: true,
 *     }),
 *   ],
 * };
 * ```
 *
 * @docsCategory DefaultSearchPlugin
 */
let DefaultSearchPlugin = DefaultSearchPlugin_1 = class DefaultSearchPlugin {
    /** @internal */
    constructor(eventBus, searchIndexService, jobQueueService) {
        this.eventBus = eventBus;
        this.searchIndexService = searchIndexService;
        this.jobQueueService = jobQueueService;
    }
    static init(options) {
        this.options = options;
        if (options.indexStockStatus === true) {
            this.addStockColumnsToEntity();
        }
        return DefaultSearchPlugin_1;
    }
    /** @internal */
    async onApplicationBootstrap() {
        this.eventBus.ofType(product_event_1.ProductEvent).subscribe(event => {
            if (event.type === 'deleted') {
                return this.searchIndexService.deleteProduct(event.ctx, event.product);
            }
            else {
                return this.searchIndexService.updateProduct(event.ctx, event.product);
            }
        });
        this.eventBus.ofType(product_variant_event_1.ProductVariantEvent).subscribe(event => {
            if (event.type === 'deleted') {
                return this.searchIndexService.deleteVariant(event.ctx, event.variants);
            }
            else {
                return this.searchIndexService.updateVariants(event.ctx, event.variants);
            }
        });
        this.eventBus.ofType(asset_event_1.AssetEvent).subscribe(event => {
            if (event.type === 'updated') {
                return this.searchIndexService.updateAsset(event.ctx, event.asset);
            }
            if (event.type === 'deleted') {
                return this.searchIndexService.deleteAsset(event.ctx, event.asset);
            }
        });
        this.eventBus.ofType(product_channel_event_1.ProductChannelEvent).subscribe(event => {
            if (event.type === 'assigned') {
                return this.searchIndexService.assignProductToChannel(event.ctx, event.product.id, event.channelId);
            }
            else {
                return this.searchIndexService.removeProductFromChannel(event.ctx, event.product.id, event.channelId);
            }
        });
        this.eventBus.ofType(product_variant_channel_event_1.ProductVariantChannelEvent).subscribe(event => {
            if (event.type === 'assigned') {
                return this.searchIndexService.assignVariantToChannel(event.ctx, event.productVariant.id, event.channelId);
            }
            else {
                return this.searchIndexService.removeVariantFromChannel(event.ctx, event.productVariant.id, event.channelId);
            }
        });
        // TODO: Remove this buffering logic because because we have dedicated buffering based on #1137
        const collectionModification$ = this.eventBus.ofType(collection_modification_event_1.CollectionModificationEvent);
        const closingNotifier$ = collectionModification$.pipe(operators_1.debounceTime(50));
        collectionModification$
            .pipe(operators_1.buffer(closingNotifier$), operators_1.filter(events => 0 < events.length), operators_1.map(events => ({
            ctx: events[0].ctx,
            ids: events.reduce((ids, e) => [...ids, ...e.productVariantIds], []),
        })), operators_1.filter(e => 0 < e.ids.length))
            .subscribe(events => {
            return this.searchIndexService.updateVariantsById(events.ctx, events.ids);
        });
        this.eventBus
            .ofType(tax_rate_modification_event_1.TaxRateModificationEvent)
            // The delay prevents a "TransactionNotStartedError" (in SQLite/sqljs) by allowing any existing
            // transactions to complete before a new job is added to the queue (assuming the SQL-based
            // JobQueueStrategy).
            // TODO: should be able to remove owing to f0fd6625
            .pipe(operators_1.delay(1))
            .subscribe(event => {
            const defaultTaxZone = event.ctx.channel.defaultTaxZone;
            if (defaultTaxZone && utils_1.idsAreEqual(defaultTaxZone.id, event.taxRate.zone.id)) {
                return this.searchIndexService.reindex(event.ctx);
            }
        });
    }
    /**
     * If the `indexStockStatus` option is set to `true`, we dynamically add a couple of
     * columns to the SearchIndexItem entity. This is done in this way to allow us to add
     * support for indexing the stock status, while preventing a backwards-incompatible
     * schema change.
     */
    static addStockColumnsToEntity() {
        const instance = new search_index_item_entity_1.SearchIndexItem();
        typeorm_1.Column({ type: 'boolean', default: true })(instance, 'inStock');
        typeorm_1.Column({ type: 'boolean', default: true })(instance, 'productInStock');
    }
};
DefaultSearchPlugin.options = {};
DefaultSearchPlugin = DefaultSearchPlugin_1 = __decorate([
    vendure_plugin_1.VendurePlugin({
        imports: [plugin_common_module_1.PluginCommonModule],
        providers: [
            fulltext_search_service_1.FulltextSearchService,
            search_index_service_1.SearchIndexService,
            indexer_controller_1.IndexerController,
            search_job_buffer_service_1.SearchJobBufferService,
            { provide: constants_1.PLUGIN_INIT_OPTIONS, useFactory: () => DefaultSearchPlugin_1.options },
            {
                provide: constants_1.BUFFER_SEARCH_INDEX_UPDATES,
                useFactory: () => DefaultSearchPlugin_1.options.bufferUpdates === true,
            },
        ],
        adminApiExtensions: {
            schema: () => DefaultSearchPlugin_1.options.indexStockStatus === true ? api_extensions_1.stockStatusExtension : undefined,
            resolvers: [fulltext_search_resolver_1.AdminFulltextSearchResolver],
        },
        shopApiExtensions: {
            schema: () => DefaultSearchPlugin_1.options.indexStockStatus === true ? api_extensions_1.stockStatusExtension : undefined,
            resolvers: [fulltext_search_resolver_1.ShopFulltextSearchResolver],
        },
        entities: [search_index_item_entity_1.SearchIndexItem],
    }),
    __metadata("design:paramtypes", [event_bus_1.EventBus,
        search_index_service_1.SearchIndexService,
        job_queue_service_1.JobQueueService])
], DefaultSearchPlugin);
exports.DefaultSearchPlugin = DefaultSearchPlugin;
//# sourceMappingURL=default-search-plugin.js.map