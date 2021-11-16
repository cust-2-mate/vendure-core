import { RequestContext } from '../../../api/common/request-context';
import { StateMachineConfig } from '../../../common/finite-state-machine/types';
import { ConfigService } from '../../../config/config.service';
import { Fulfillment } from '../../../entity/fulfillment/fulfillment.entity';
import { Order } from '../../../entity/order/order.entity';
import { HistoryService } from '../../services/history.service';
import { FulfillmentState, FulfillmentTransitionData } from './fulfillment-state';
export declare class FulfillmentStateMachine {
    private configService;
    private historyService;
    readonly config: StateMachineConfig<FulfillmentState, FulfillmentTransitionData>;
    private readonly initialState;
    constructor(configService: ConfigService, historyService: HistoryService);
    getInitialState(): FulfillmentState;
    canTransition(currentState: FulfillmentState, newState: FulfillmentState): boolean;
    getNextStates(fulfillment: Fulfillment): ReadonlyArray<FulfillmentState>;
    transition(ctx: RequestContext, fulfillment: Fulfillment, orders: Order[], state: FulfillmentState): Promise<void>;
    /**
     * Specific business logic to be executed on Fulfillment state transitions.
     */
    private onTransitionStart;
    /**
     * Specific business logic to be executed after Fulfillment state transition completes.
     */
    private onTransitionEnd;
    private initConfig;
}
