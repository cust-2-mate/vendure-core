import { RequestContext } from '../../../api/common/request-context';
import { StateMachineConfig } from '../../../common/finite-state-machine/types';
import { ConfigService } from '../../../config/config.service';
import { Order } from '../../../entity/order/order.entity';
import { HistoryService } from '../../services/history.service';
import { PromotionService } from '../../services/promotion.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { TransactionalConnection } from '../../transaction/transactional-connection';
import { OrderState, OrderTransitionData } from './order-state';
export declare class OrderStateMachine {
    private connection;
    private configService;
    private stockMovementService;
    private historyService;
    private promotionService;
    readonly config: StateMachineConfig<OrderState, OrderTransitionData>;
    private readonly initialState;
    constructor(connection: TransactionalConnection, configService: ConfigService, stockMovementService: StockMovementService, historyService: HistoryService, promotionService: PromotionService);
    getInitialState(): OrderState;
    canTransition(currentState: OrderState, newState: OrderState): boolean;
    getNextStates(order: Order): ReadonlyArray<OrderState>;
    transition(ctx: RequestContext, order: Order, state: OrderState): Promise<void>;
    private findOrderWithFulfillments;
    /**
     * Specific business logic to be executed on Order state transitions.
     */
    private onTransitionStart;
    /**
     * Specific business logic to be executed after Order state transition completes.
     */
    private onTransitionEnd;
    private initConfig;
}
