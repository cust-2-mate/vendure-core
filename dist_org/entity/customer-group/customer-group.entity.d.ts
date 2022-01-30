import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
/**
 * @description
 * A grouping of {@link Customer}s which enables features such as group-based promotions
 * or tax rules.
 *
 * @docsCategory entities
 */
export declare class CustomerGroup extends VendureEntity {
    constructor(input?: DeepPartial<CustomerGroup>);
    name: string;
    customers: Customer[];
}
