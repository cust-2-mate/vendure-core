import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Customer } from '../customer/customer.entity';
import { HistoryEntry } from './history-entry.entity';
export declare class CustomerHistoryEntry extends HistoryEntry {
    constructor(input: DeepPartial<CustomerHistoryEntry>);
    customer: Customer;
}
