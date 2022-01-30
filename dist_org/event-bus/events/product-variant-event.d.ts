import { RequestContext } from '../../api/common/request-context';
import { ProductVariant } from '../../entity';
import { VendureEvent } from '../vendure-event';
/**
 * @description
 * This event is fired whenever a {@link ProductVariant} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export declare class ProductVariantEvent extends VendureEvent {
    ctx: RequestContext;
    variants: ProductVariant[];
    type: 'created' | 'updated' | 'deleted';
    constructor(ctx: RequestContext, variants: ProductVariant[], type: 'created' | 'updated' | 'deleted');
}
