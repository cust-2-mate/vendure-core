"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlSearchStrategy = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const typeorm_1 = require("typeorm");
const errors_1 = require("../../../common/error/errors");
const search_index_item_entity_1 = require("../entities/search-index-item.entity");
const search_strategy_common_1 = require("./search-strategy-common");
const search_strategy_utils_1 = require("./search-strategy-utils");
/**
 * A weighted fulltext search for MySQL / MariaDB.
 */
class MysqlSearchStrategy {
    constructor(connection, options) {
        this.connection = connection;
        this.options = options;
        this.minTermLength = 2;
    }
    async getFacetValueIds(ctx, input, enabledOnly) {
        const facetValuesQb = this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .createQueryBuilder('si')
            .select(['MIN(productId)', 'MIN(productVariantId)'])
            .addSelect('GROUP_CONCAT(facetValueIds)', 'facetValues');
        this.applyTermAndFilters(ctx, facetValuesQb, Object.assign(Object.assign({}, input), { groupByProduct: true }));
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
            .select(['MIN(productId)', 'MIN(productVariantId)'])
            .addSelect('GROUP_CONCAT(collectionIds)', 'collections');
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
        const qb = this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .createQueryBuilder('si')
            .select(this.createMysqlSelect(!!input.groupByProduct));
        if (input.groupByProduct) {
            qb.addSelect('MIN(price)', 'minPrice')
                .addSelect('MAX(price)', 'maxPrice')
                .addSelect('MIN(priceWithTax)', 'minPriceWithTax')
                .addSelect('MAX(priceWithTax)', 'maxPriceWithTax');
        }
        this.applyTermAndFilters(ctx, qb, input);
        if (sort) {
            if (sort.name) {
                qb.addOrderBy(input.groupByProduct ? 'MIN(productName)' : 'productName', sort.name);
            }
            if (sort.price) {
                qb.addOrderBy(input.groupByProduct ? 'MIN(price)' : 'price', sort.price);
            }
        }
        else {
            if (input.term && input.term.length > this.minTermLength) {
                qb.orderBy('score', 'DESC');
            }
        }
        if (enabledOnly) {
            qb.andWhere('si.enabled = :enabled', { enabled: true });
        }
        return qb
            .take(take)
            .skip(skip)
            .getRawMany()
            .then(res => res.map(r => search_strategy_utils_1.mapToSearchResult(r, ctx.channel.currencyCode)));
    }
    async getTotalCount(ctx, input, enabledOnly) {
        const innerQb = this.applyTermAndFilters(ctx, this.connection
            .getRepository(search_index_item_entity_1.SearchIndexItem)
            .createQueryBuilder('si')
            .select(this.createMysqlSelect(!!input.groupByProduct)), input);
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
        if (term && term.length > this.minTermLength) {
            const termScoreQuery = this.connection
                .getRepository(search_index_item_entity_1.SearchIndexItem)
                .createQueryBuilder('si_inner')
                .select('si_inner.productId', 'inner_productId')
                .addSelect('si_inner.productVariantId', 'inner_productVariantId')
                .addSelect(`IF (sku LIKE :like_term, 10, 0)`, 'sku_score')
                .addSelect(`(SELECT sku_score) +
                     MATCH (productName) AGAINST (:term IN BOOLEAN MODE) * 2 +
                     MATCH (productVariantName) AGAINST (:term IN BOOLEAN MODE) * 1.5 +
                     MATCH (description) AGAINST (:term IN BOOLEAN MODE) * 1`, 'score')
                .where(new typeorm_1.Brackets(qb1 => {
                qb1.where('sku LIKE :like_term')
                    .orWhere('MATCH (productName) AGAINST (:term IN BOOLEAN MODE)')
                    .orWhere('MATCH (productVariantName) AGAINST (:term IN BOOLEAN MODE)')
                    .orWhere('MATCH (description) AGAINST (:term IN BOOLEAN MODE)');
            }))
                .andWhere('channelId = :channelId')
                .setParameters({ term: `${term}*`, like_term: `%${term}%`, channelId: ctx.channelId });
            qb.innerJoin(`(${termScoreQuery.getQuery()})`, 'term_result', 'inner_productId = si.productId')
                .addSelect(input.groupByProduct ? 'MAX(term_result.score)' : 'term_result.score', 'score')
                .andWhere('term_result.inner_productVariantId = si.productVariantId')
                .setParameters(termScoreQuery.getParameters());
        }
        else {
            qb.addSelect('1 as score');
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
                    const clause = `FIND_IN_SET(:${placeholder}, facetValueIds)`;
                    const params = { [placeholder]: id };
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
                            const clause = `FIND_IN_SET(:${placeholder}, facetValueIds)`;
                            const params = { [placeholder]: facetValueFilter.and };
                            qb2.where(clause, params);
                        }
                        if ((_b = facetValueFilter.or) === null || _b === void 0 ? void 0 : _b.length) {
                            for (const id of facetValueFilter.or) {
                                const placeholder = search_strategy_utils_1.createPlaceholderFromId(id);
                                const clause = `FIND_IN_SET(:${placeholder}, facetValueIds)`;
                                const params = { [placeholder]: id };
                                qb2.orWhere(clause, params);
                            }
                        }
                    }));
                }
            }));
        }
        if (collectionId) {
            qb.andWhere(`FIND_IN_SET (:collectionId, collectionIds)`, { collectionId });
        }
        if (collectionSlug) {
            qb.andWhere(`FIND_IN_SET (:collectionSlug, collectionSlugs)`, { collectionSlug });
        }
        qb.andWhere('languageCode = :languageCode', { languageCode: ctx.languageCode });
        qb.andWhere('channelId = :channelId', { channelId: ctx.channelId });
        if (input.groupByProduct === true) {
            qb.groupBy('productId');
            qb.addSelect('BIT_OR(enabled)', 'productEnabled');
        }
        return qb;
    }
    /**
     * When a select statement includes a GROUP BY clause,
     * then all selected columns must be aggregated. So we just apply the
     * "MIN" function in this case to all other columns than the productId.
     */
    createMysqlSelect(groupByProduct) {
        return search_strategy_common_1.getFieldsToSelect(this.options.indexStockStatus)
            .map(col => {
            const qualifiedName = `si.${col}`;
            const alias = `si_${col}`;
            if (groupByProduct && col !== 'productId') {
                if (col === 'facetIds' ||
                    col === 'facetValueIds' ||
                    col === 'collectionIds' ||
                    col === 'channelIds') {
                    return `GROUP_CONCAT(${qualifiedName}) as "${alias}"`;
                }
                else if (col === 'enabled' || col === 'inStock' || col === 'productInStock') {
                    return `MAX(${qualifiedName}) as "${alias}"`;
                }
                else {
                    return `MIN(${qualifiedName}) as "${alias}"`;
                }
            }
            else {
                return `${qualifiedName} as "${alias}"`;
            }
        })
            .join(', ');
    }
}
exports.MysqlSearchStrategy = MysqlSearchStrategy;
//# sourceMappingURL=mysql-search-strategy.js.map