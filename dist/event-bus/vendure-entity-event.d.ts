import { RequestContext } from '../api';
import { VendureEvent } from './vendure-event';
/**
 * @description
 * The base class for all entity events used by the EventBus system.
 * * For event type `'updated'` the entity is the one before applying the patch (if not documented otherwise).
 * * For event type `'deleted'` the input will most likely be an `id: ID`
 *
 * @docsCategory events
 * */
export declare abstract class VendureEntityEvent<Entity, Input = any> extends VendureEvent {
    readonly entity: Entity;
    readonly type: 'created' | 'updated' | 'deleted';
    readonly ctx: RequestContext;
    readonly input?: Input;
    protected constructor(entity: Entity, type: 'created' | 'updated' | 'deleted', ctx: RequestContext, input?: Input);
}
