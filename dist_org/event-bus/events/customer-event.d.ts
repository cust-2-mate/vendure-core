import { RequestContext } from '../../api/common/request-context';
import { Customer } from '../../entity/customer/customer.entity';
import { VendureEvent } from '../vendure-event';
/**
 * @description
 * This event is fired whenever a {@link Customer} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export declare class CustomerEvent extends VendureEvent {
    ctx: RequestContext;
    customer: Customer;
    type: 'created' | 'updated' | 'deleted';
    constructor(ctx: RequestContext, customer: Customer, type: 'created' | 'updated' | 'deleted');
}
