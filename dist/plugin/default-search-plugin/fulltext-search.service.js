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
exports.FulltextSearchService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../common/error/errors");
const event_bus_1 = require("../../event-bus/event-bus");
const facet_value_service_1 = require("../../service/services/facet-value.service");
const collection_service_1 = require("../../service/services/collection.service");
const product_variant_service_1 = require("../../service/services/product-variant.service");
const search_service_1 = require("../../service/services/search.service");
const transactional_connection_1 = require("../../service/transaction/transactional-connection");
const search_index_service_1 = require("./indexer/search-index.service");
const mysql_search_strategy_1 = require("./search-strategy/mysql-search-strategy");
const postgres_search_strategy_1 = require("./search-strategy/postgres-search-strategy");
const sqlite_search_strategy_1 = require("./search-strategy/sqlite-search-strategy");
/**
 * Search indexing and full-text search for supported databases. See the various
 * SearchStrategy implementations for db-specific code.
 */
let FulltextSearchService = class FulltextSearchService {
    constructor(connection, eventBus, facetValueService, collectionService, productVariantService, searchIndexService, searchService) {
        this.connection = connection;
        this.eventBus = eventBus;
        this.facetValueService = facetValueService;
        this.collectionService = collectionService;
        this.productVariantService = productVariantService;
        this.searchIndexService = searchIndexService;
        this.searchService = searchService;
        this.minTermLength = 2;
        this.searchService.adopt(this);
        this.setSearchStrategy();
    }
    /**
     * Perform a fulltext search according to the provided input arguments.
     */
    async search(ctx, input, enabledOnly = false) {
        const items = await this.searchStrategy.getSearchResults(ctx, input, enabledOnly);
        const totalItems = await this.searchStrategy.getTotalCount(ctx, input, enabledOnly);
        return {
            items,
            totalItems,
        };
    }
    /**
     * Return a list of all FacetValues which appear in the result set.
     */
    async facetValues(ctx, input, enabledOnly = false) {
        const facetValueIdsMap = await this.searchStrategy.getFacetValueIds(ctx, input, enabledOnly);
        const facetValues = await this.facetValueService.findByIds(ctx, Array.from(facetValueIdsMap.keys()));
        return facetValues.map((facetValue, index) => {
            return {
                facetValue,
                count: facetValueIdsMap.get(facetValue.id.toString()),
            };
        });
    }
    /**
     * Return a list of all Collections which appear in the result set.
     */
    async collections(ctx, input, enabledOnly = false) {
        const collectionIdsMap = await this.searchStrategy.getCollectionIds(ctx, input, enabledOnly);
        const collections = await this.collectionService.findByIds(ctx, Array.from(collectionIdsMap.keys()));
        return collections.map((collection, index) => {
            return {
                collection,
                count: collectionIdsMap.get(collection.id.toString()),
            };
        });
    }
    /**
     * Rebuilds the full search index.
     */
    async reindex(ctx) {
        const job = await this.searchIndexService.reindex(ctx);
        return job;
    }
    /**
     * Sets the SearchStrategy appropriate to th configured database type.
     */
    setSearchStrategy() {
        switch (this.connection.rawConnection.options.type) {
            case 'mysql':
            case 'mariadb':
                this.searchStrategy = new mysql_search_strategy_1.MysqlSearchStrategy(this.connection);
                break;
            case 'sqlite':
            case 'sqljs':
            case 'better-sqlite3':
                this.searchStrategy = new sqlite_search_strategy_1.SqliteSearchStrategy(this.connection);
                break;
            case 'postgres':
                this.searchStrategy = new postgres_search_strategy_1.PostgresSearchStrategy(this.connection);
                break;
            default:
                throw new errors_1.InternalServerError(`error.database-not-supported-by-default-search-plugin`);
        }
    }
};
FulltextSearchService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        event_bus_1.EventBus,
        facet_value_service_1.FacetValueService,
        collection_service_1.CollectionService,
        product_variant_service_1.ProductVariantService,
        search_index_service_1.SearchIndexService,
        search_service_1.SearchService])
], FulltextSearchService);
exports.FulltextSearchService = FulltextSearchService;
//# sourceMappingURL=fulltext-search.service.js.map