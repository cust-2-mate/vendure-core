"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteSearchStrategy = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const typeorm_1 = require("typeorm");
const errors_1 = require("../../../common/error/errors");
const search_index_item_entity_1 = require("../entities/search-index-item.entity");
const search_strategy_utils_1 = require("./search-strategy-utils");
/**
 * A rather naive search for SQLite / SQL.js. Rather than proper
 * full-text searching, it uses a weighted `LIKE "%term%"` operator instead.
 */
class SqliteSearchStrategy {
    constructor(connection, options) {
        this.connection = connection;
        this.options = options;
        this.minTermLength = 2;
    }
    async getFacetValueIds(ctx, input, enabledOnly) {
        const facetValuesQb = this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .createQueryBuilder('si')
            .select(['productId', 'productVariantId'])
            .addSelect('GROUP_CONCAT(si.facetValueIds)', 'facetValues');
        this.applyTermAndFilters(ctx, facetValuesQb, input);
        if (!input.groupByProduct) {
            facetValuesQb.groupBy('productVariantId');
        }
        if (enabledOnly) {
            facetValuesQb.andWhere('si.enabled = :enabled', { enabled: true });
        }
        const facetValuesResult = await facetValuesQb.getRawMany();
        return search_strategy_utils_1.createFacetIdCountMap(facetValuesResult);
    }
    async getCollectionIds(ctx, input, enabledOnly) {
        const collectionsQb = this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .createQueryBuilder('si')
            .select(['productId', 'productVariantId'])
            .addSelect('GROUP_CONCAT(si.collectionIds)', 'collections');
        this.applyTermAndFilters(ctx, collectionsQb, input);
        if (!input.groupByProduct) {
            collectionsQb.groupBy('productVariantId');
        }
        if (enabledOnly) {
            collectionsQb.andWhere('si.enabled = :enabled', { enabled: true });
        }
        const collectionsResult = await collectionsQb.getRawMany();
        return search_strategy_utils_1.createCollectionIdCountMap(collectionsResult);
    }
    async getSearchResults(ctx, input, enabledOnly) {
        const take = input.take || 25;
        const skip = input.skip || 0;
        const sort = input.sort;
        const qb = this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).createQueryBuilder('si');
        if (input.groupByProduct) {
            qb.addSelect('MIN(price)', 'minPrice').addSelect('MAX(price)', 'maxPrice');
            qb.addSelect('MIN(priceWithTax)', 'minPriceWithTax').addSelect('MAX(priceWithTax)', 'maxPriceWithTax');
        }
        this.applyTermAndFilters(ctx, qb, input);
        if (input.term && input.term.length > this.minTermLength) {
            qb.orderBy('score', 'DESC');
        }
        if (sort) {
            if (sort.name) {
                qb.addOrderBy('productName', sort.name);
            }
            if (sort.price) {
                qb.addOrderBy('price', sort.price);
            }
        }
        else {
            qb.addOrderBy('productVariantId', 'ASC');
        }
        if (enabledOnly) {
            qb.andWhere('si.enabled = :enabled', { enabled: true });
        }
        return await qb
            .take(take)
            .skip(skip)
            .getRawMany()
            .then(res => res.map(r => search_strategy_utils_1.mapToSearchResult(r, ctx.channel.currencyCode)));
    }
    async getTotalCount(ctx, input, enabledOnly) {
        const innerQb = this.applyTermAndFilters(ctx, this.connection.getRepository(search_index_item_entity_1.SearchIndexItem).createQueryBuilder('si'), input);
        if (enabledOnly) {
            innerQb.andWhere('si.enabled = :enabled', { enabled: true });
        }
        const totalItemsQb = this.connection.rawConnection
            .createQueryBuilder()
            .select('COUNT(*) as total')
            .from(`(${innerQb.getQuery()})`, 'inner')
            .setParameters(innerQb.getParameters());
        return totalItemsQb.getRawOne().then(res => res.total);
    }
    applyTermAndFilters(ctx, qb, input) {
        const { term, facetValueFilters, facetValueIds, facetValueOperator, collectionId, collectionSlug } = input;
        qb.where('1 = 1');
        if (term && term.length > this.minTermLength) {
            // Note: SQLite does not natively have fulltext search capabilities,
            // so we just use a weighted LIKE match
            qb.addSelect(`
                    CASE WHEN sku LIKE :like_term THEN 10 ELSE 0 END +
                    CASE WHEN productName LIKE :like_term THEN 3 ELSE 0 END +
                    CASE WHEN productVariantName LIKE :like_term THEN 2 ELSE 0 END +
                    CASE WHEN description LIKE :like_term THEN 1 ELSE 0 END`, 'score')
                .andWhere(new typeorm_1.Brackets(qb1 => {
                qb1.where('sku LIKE :like_term')
                    .orWhere('productName LIKE :like_term')
                    .orWhere('productVariantName LIKE :like_term')
                    .orWhere('description LIKE :like_term');
            }))
                .setParameters({ term, like_term: `%${term}%` });
        }
        if (input.inStock != null) {
            if (input.groupByProduct) {
                qb.andWhere('productInStock = :inStock', { inStock: input.inStock });
            }
            else {
                qb.andWhere('inStock = :inStock', { inStock: input.inStock });
            }
        }
        if (facetValueIds === null || facetValueIds === void 0 ? void 0 : facetValueIds.length) {
            qb.andWhere(new typeorm_1.Brackets(qb1 => {
                for (const id of facetValueIds) {
                    const placeholder = search_strategy_utils_1.createPlaceholderFromId(id);
                    const clause = `(',' || facetValueIds || ',') LIKE :${placeholder}`;
                    const params = { [placeholder]: `%,${id},%` };
                    if (facetValueOperator === generated_types_1.LogicalOperator.AND) {
                        qb1.andWhere(clause, params);
                    }
                    else {
                        qb1.orWhere(clause, params);
                    }
                }
            }));
        }
        if (facetValueFilters === null || facetValueFilters === void 0 ? void 0 : facetValueFilters.length) {
            qb.andWhere(new typeorm_1.Brackets(qb1 => {
                for (const facetValueFilter of facetValueFilters) {
                    qb1.andWhere(new typeorm_1.Brackets(qb2 => {
                        var _a, _b;
                        if (facetValueFilter.and && ((_a = facetValueFilter.or) === null || _a === void 0 ? void 0 : _a.length)) {
                            throw new errors_1.UserInputError('error.facetfilterinput-invalid-input');
                        }
                        if (facetValueFilter.and) {
                            const placeholder = search_strategy_utils_1.createPlaceholderFromId(facetValueFilter.and);
                            const clause = `(',' || facetValueIds || ',') LIKE :${placeholder}`;
                            const params = { [placeholder]: `%,${facetValueFilter.and},%` };
                            qb2.where(clause, params);
                        }
                        if ((_b = facetValueFilter.or) === null || _b === void 0 ? void 0 : _b.length) {
                            for (const id of facetValueFilter.or) {
                                const placeholder = search_strategy_utils_1.createPlaceholderFromId(id);
                                const clause = `(',' || facetValueIds || ',') LIKE :${placeholder}`;
                                const params = { [placeholder]: `%,${id},%` };
                                qb2.orWhere(clause, params);
                            }
                        }
                    }));
                }
            }));
        }
        if (collectionId) {
            qb.andWhere(`(',' || collectionIds || ',') LIKE :collectionId`, {
                collectionId: `%,${collectionId},%`,
            });
        }
        if (collectionSlug) {
            qb.andWhere(`(',' || collectionSlugs || ',') LIKE :collectionSlug`, {
                collectionSlug: `%,${collectionSlug},%`,
            });
        }
        qb.andWhere('languageCode = :languageCode', { languageCode: ctx.languageCode });
        qb.andWhere('channelId = :channelId', { channelId: ctx.channelId });
        if (input.groupByProduct === true) {
            qb.groupBy('productId');
        }
        return qb;
    }
}
exports.SqliteSearchStrategy = SqliteSearchStrategy;
//# sourceMappingURL=sqlite-search-strategy.js.map