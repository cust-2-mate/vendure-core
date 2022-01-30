import { RequestContext } from '../../../api/common/request-context';
import { ConfigService } from '../../../config/config.service';
import { Order } from '../../../entity/order/order.entity';
import { Refund } from '../../../entity/refund/refund.entity';
import { HistoryService } from '../../services/history.service';
import { RefundState } from './refund-state';
export declare class RefundStateMachine {
    private configService;
    private historyService;
    private readonly config;
    constructor(configService: ConfigService, historyService: HistoryService);
    getNextStates(refund: Refund): ReadonlyArray<RefundState>;
    transition(ctx: RequestContext, order: Order, refund: Refund, state: RefundState): Promise<void>;
}
