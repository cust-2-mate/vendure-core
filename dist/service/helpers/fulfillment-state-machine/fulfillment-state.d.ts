import { RequestContext } from '../../../api/common/request-context';
import { Transitions } from '../../../common/finite-state-machine/types';
import { Fulfillment } from '../../../entity/fulfillment/fulfillment.entity';
import { Order } from '../../../entity/order/order.entity';
/**
 * @description
 * These are the default states of the fulfillment process.
 *
 * @docsCategory fulfillment
 */
export declare type FulfillmentState = 'Created' | 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
export declare const fulfillmentStateTransitions: Transitions<FulfillmentState>;
/**
 * @description
 * The data which is passed to the state transition handlers of the FulfillmentStateMachine.
 *
 * @docsCategory fulfillment
 */
export interface FulfillmentTransitionData {
    ctx: RequestContext;
    orders: Order[];
    fulfillment: Fulfillment;
}
