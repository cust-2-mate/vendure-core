import { Type } from '@vendure/common/lib/shared-types';
import { Connection, OrderByCondition } from 'typeorm';
import { NullOptionals, SortParameter } from '../../../common/types/common-types';
import { VendureEntity } from '../../../entity/base/base.entity';
/**
 * Parses the provided SortParameter array against the metadata of the given entity, ensuring that only
 * valid fields are being sorted against. The output assumes
 * @param connection
 * @param entity
 * @param sortParams
 */
export declare function parseSortParams<T extends VendureEntity>(connection: Connection, entity: Type<T>, sortParams?: NullOptionals<SortParameter<T>> | null, customPropertyMap?: {
    [name: string]: string;
}): OrderByCondition;
