import { RequestContext } from '../../../api/common/request-context';
import { Transitions } from '../../../common/finite-state-machine/types';
import { Order } from '../../../entity/order/order.entity';
/**
 * @description
 * These are the default states of the Order process. They can be augmented and
 * modified by using the {@link OrderOptions} `process` property.
 *
 * @docsCategory orders
 */
export declare type OrderState = 'Created' | 'AddingItems' | 'ArrangingPayment' | 'PaymentAuthorized' | 'PaymentSettled' | 'PartiallyShipped' | 'Shipped' | 'PartiallyDelivered' | 'Delivered' | 'Modifying' | 'ArrangingAdditionalPayment' | 'Cancelled';
export declare const orderStateTransitions: Transitions<OrderState>;
export interface OrderTransitionData {
    ctx: RequestContext;
    order: Order;
}
