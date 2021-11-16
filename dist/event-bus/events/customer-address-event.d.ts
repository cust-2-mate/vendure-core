import { RequestContext } from '../../api/common/request-context';
import { Address } from '../../entity/address/address.entity';
import { VendureEvent } from '../vendure-event';
/**
 * @description
 * This event is fired whenever a {@link Customer} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export declare class CustomerAddressEvent extends VendureEvent {
    ctx: RequestContext;
    address: Address;
    type: 'created' | 'updated' | 'deleted';
    constructor(ctx: RequestContext, address: Address, type: 'created' | 'updated' | 'deleted');
}
