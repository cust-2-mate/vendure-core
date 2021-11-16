import { RequestContext } from '../../api/common/request-context';
import { Product } from '../../entity';
import { VendureEvent } from '../vendure-event';
/**
 * @description
 * This event is fired whenever a {@link Product} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export declare class ProductEvent extends VendureEvent {
    ctx: RequestContext;
    product: Product;
    type: 'created' | 'updated' | 'deleted';
    constructor(ctx: RequestContext, product: Product, type: 'created' | 'updated' | 'deleted');
}
