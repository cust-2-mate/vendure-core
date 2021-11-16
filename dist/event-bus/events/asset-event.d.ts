import { RequestContext } from '../../api/common/request-context';
import { Asset } from '../../entity';
import { VendureEvent } from '../vendure-event';
/**
 * @description
 * This event is fired whenever aa {@link Asset} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export declare class AssetEvent extends VendureEvent {
    ctx: RequestContext;
    asset: Asset;
    type: 'created' | 'updated' | 'deleted';
    constructor(ctx: RequestContext, asset: Asset, type: 'created' | 'updated' | 'deleted');
}
