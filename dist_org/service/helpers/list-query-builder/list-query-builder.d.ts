import { OnApplicationBootstrap } from '@nestjs/common';
import { ID, Type } from '@vendure/common/lib/shared-types';
import { FindConditions, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { RequestContext } from '../../../api/common/request-context';
import { ListQueryOptions } from '../../../common/types/common-types';
import { ConfigService } from '../../../config/config.service';
import { VendureEntity } from '../../../entity/base/base.entity';
import { TransactionalConnection } from '../../transaction/transactional-connection';
export declare type ExtendedListQueryOptions<T extends VendureEntity> = {
    relations?: string[];
    channelId?: ID;
    where?: FindConditions<T>;
    orderBy?: FindOneOptions<T>['order'];
    /**
     * When a RequestContext is passed, then the query will be
     * executed as part of any outer transaction.
     */
    ctx?: RequestContext;
    /**
     * One of the main tasks of the ListQueryBuilder is to auto-generate filter and sort queries based on the
     * available columns of a given entity. However, it may also be sometimes desirable to allow filter/sort
     * on a property of a relation. In this case, the `customPropertyMap` can be used to define a property
     * of the `options.sort` or `options.filter` which does not correspond to a direct column of the current
     * entity, and then provide a mapping to the related property to be sorted/filtered.
     *
     * Example: we want to allow sort/filter by and Order's `customerLastName`. The actual lastName property is
     * not a column in the Order table, it exists on the Customer entity, and Order has a relation to Customer via
     * `Order.customer`. Therefore we can define a customPropertyMap like this:
     *
     * ```ts
     * const qb = this.listQueryBuilder.build(Order, options, {
     *   relations: ['customer'],
     *   customPropertyMap: {
     *       customerLastName: 'customer.lastName',
     *   },
     * };
     * ```
     */
    customPropertyMap?: {
        [name: string]: string;
    };
};
export declare class ListQueryBuilder implements OnApplicationBootstrap {
    private connection;
    private configService;
    constructor(connection: TransactionalConnection, configService: ConfigService);
    onApplicationBootstrap(): any;
    /**
     * Creates and configures a SelectQueryBuilder for queries that return paginated lists of entities.
     */
    build<T extends VendureEntity>(entity: Type<T>, options?: ListQueryOptions<T>, extendedOptions?: ExtendedListQueryOptions<T>): SelectQueryBuilder<T>;
    private parseTakeSkipParams;
    /**
     * If a customPropertyMap is provided, we need to take the path provided and convert it to the actual
     * relation aliases being used by the SelectQueryBuilder.
     *
     * This method mutates the customPropertyMap object.
     */
    private normalizeCustomPropertyMap;
    /**
     * Some calculated columns (those with the `@Calculated()` decorator) require extra joins in order
     * to derive the data needed for their expressions.
     */
    private joinCalculatedColumnRelations;
    /**
     * If this entity is Translatable, then we need to apply appropriate WHERE clauses to limit
     * the joined translation relations. This method applies a simple "WHERE" on the languageCode
     * in the case of the default language, otherwise we use a more complex.
     */
    private applyTranslationConditions;
    /**
     * Registers a user-defined function (for flavors of SQLite driver that support it)
     * so that we can run regex filters on string fields.
     */
    private registerSQLiteRegexpFunction;
}
