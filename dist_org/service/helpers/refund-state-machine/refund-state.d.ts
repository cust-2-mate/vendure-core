import { RequestContext } from '../../../api/common/request-context';
import { Transitions } from '../../../common/finite-state-machine/types';
import { Order } from '../../../entity/order/order.entity';
import { Refund } from '../../../entity/refund/refund.entity';
/**
 * @description
 * These are the default states of the refund process.
 *
 * @docsCategory payment
 */
export declare type RefundState = 'Pending' | 'Settled' | 'Failed';
export declare const refundStateTransitions: Transitions<RefundState>;
/**
 * @description
 * The data which is passed to the state transition handlers of the RefundStateMachine.
 *
 * @docsCategory payment
 */
export interface RefundTransitionData {
    ctx: RequestContext;
    order: Order;
    refund: Refund;
}
