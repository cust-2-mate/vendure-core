import { ManualPaymentInput, RefundOrderInput } from '@vendure/common/lib/generated-types';
import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { PaymentStateTransitionError, RefundStateTransitionError } from '../../common/error/generated-graphql-admin-errors';
import { IneligiblePaymentMethodError } from '../../common/error/generated-graphql-shop-errors';
import { OrderItem } from '../../entity/order-item/order-item.entity';
import { Order } from '../../entity/order/order.entity';
import { Payment } from '../../entity/payment/payment.entity';
import { Refund } from '../../entity/refund/refund.entity';
import { EventBus } from '../../event-bus/event-bus';
import { PaymentState } from '../helpers/payment-state-machine/payment-state';
import { PaymentStateMachine } from '../helpers/payment-state-machine/payment-state-machine';
import { RefundStateMachine } from '../helpers/refund-state-machine/refund-state-machine';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { PaymentMethodService } from './payment-method.service';
export declare class PaymentService {
    private connection;
    private paymentStateMachine;
    private refundStateMachine;
    private paymentMethodService;
    private eventBus;
    constructor(connection: TransactionalConnection, paymentStateMachine: PaymentStateMachine, refundStateMachine: RefundStateMachine, paymentMethodService: PaymentMethodService, eventBus: EventBus);
    create(ctx: RequestContext, input: DeepPartial<Payment>): Promise<Payment>;
    findOneOrThrow(ctx: RequestContext, id: ID, relations?: string[]): Promise<Payment>;
    transitionToState(ctx: RequestContext, paymentId: ID, state: PaymentState): Promise<Payment | PaymentStateTransitionError>;
    getNextStates(payment: Payment): ReadonlyArray<PaymentState>;
    createPayment(ctx: RequestContext, order: Order, amount: number, method: string, metadata: any): Promise<Payment | IneligiblePaymentMethodError>;
    settlePayment(ctx: RequestContext, paymentId: ID): Promise<PaymentStateTransitionError | Payment>;
    /**
     * Creates a Payment from the manual payment mutation in the Admin API
     */
    createManualPayment(ctx: RequestContext, order: Order, amount: number, input: ManualPaymentInput): Promise<Payment>;
    /**
     * Creates a Refund against the specified Payment. If the amount to be refunded exceeds the value of the
     * specified Payment (in the case of multiple payments on a single Order), then the remaining outstanding
     * refund amount will be refunded against the next available Payment from the Order.
     */
    createRefund(ctx: RequestContext, input: RefundOrderInput, order: Order, items: OrderItem[], selectedPayment: Payment): Promise<Refund | RefundStateTransitionError>;
    private mergePaymentMetadata;
}
