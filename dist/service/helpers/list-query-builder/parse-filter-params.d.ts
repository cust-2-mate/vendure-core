import { Type } from '@vendure/common/lib/shared-types';
import { Connection } from 'typeorm';
import { FilterParameter, NullOptionals } from '../../../common/types/common-types';
import { VendureEntity } from '../../../entity/base/base.entity';
export interface WhereCondition {
    clause: string;
    parameters: {
        [param: string]: string | number;
    };
}
export declare function parseFilterParams<T extends VendureEntity>(connection: Connection, entity: Type<T>, filterParams?: NullOptionals<FilterParameter<T>> | null, customPropertyMap?: {
    [name: string]: string;
}): WhereCondition[];
