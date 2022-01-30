import { ConfigArg } from '@vendure/common/lib/generated-types';
import { SelectQueryBuilder } from 'typeorm';
import { ConfigArgs, ConfigArgValues, ConfigurableOperationDef, ConfigurableOperationDefOptions } from '../../common/configurable-operation';
import { ProductVariant } from '../../entity/product-variant/product-variant.entity';
export declare type ApplyCollectionFilterFn<T extends ConfigArgs> = (qb: SelectQueryBuilder<ProductVariant>, args: ConfigArgValues<T>) => SelectQueryBuilder<ProductVariant>;
export interface CollectionFilterConfig<T extends ConfigArgs> extends ConfigurableOperationDefOptions<T> {
    apply: ApplyCollectionFilterFn<T>;
}
/**
 * @description
 * A CollectionFilter defines a rule which can be used to associate ProductVariants with a Collection.
 * The filtering is done by defining the `apply()` function, which receives a TypeORM
 * [`QueryBuilder`](https://typeorm.io/#/select-query-builder) object to which clauses may be added.
 *
 * Creating a CollectionFilter is considered an advanced Vendure topic. For more insight into how
 * they work, study the [default collection filters](https://github.com/vendure-ecommerce/vendure/blob/master/packages/core/src/config/collection/default-collection-filters.ts)
 *
 * @docsCategory configuration
 */
export declare class CollectionFilter<T extends ConfigArgs = ConfigArgs> extends ConfigurableOperationDef<T> {
    private readonly applyFn;
    constructor(config: CollectionFilterConfig<T>);
    apply(qb: SelectQueryBuilder<ProductVariant>, args: ConfigArg[]): SelectQueryBuilder<ProductVariant>;
}
