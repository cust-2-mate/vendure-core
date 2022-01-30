import { RequestContext } from '../../../api/common/request-context';
import { ConfigService } from '../../../config/config.service';
import { Order } from '../../../entity/order/order.entity';
import { Payment } from '../../../entity/payment/payment.entity';
import { HistoryService } from '../../services/history.service';
import { PaymentState } from './payment-state';
export declare class PaymentStateMachine {
    private configService;
    private historyService;
    private readonly config;
    private readonly initialState;
    constructor(configService: ConfigService, historyService: HistoryService);
    getInitialState(): PaymentState;
    canTransition(currentState: PaymentState, newState: PaymentState): boolean;
    getNextStates(payment: Payment): ReadonlyArray<PaymentState>;
    transition(ctx: RequestContext, order: Order, payment: Payment, state: PaymentState): Promise<void>;
    /**
     * Specific business logic to be executed on Payment state transitions.
     */
    private onTransitionStart;
    private onTransitionEnd;
    private initConfig;
}
