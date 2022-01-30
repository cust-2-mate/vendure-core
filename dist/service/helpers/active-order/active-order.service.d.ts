import { RequestContext } from '../../../api/common/request-context';
import { TransactionalConnection } from '../../../connection/transactional-connection';
import { Order } from '../../../entity/order/order.entity';
import { OrderService } from '../../services/order.service';
import { SessionService } from '../../services/session.service';
/**
 * @description
 * This helper class is used to get a reference to the active Order from the current RequestContext.
 *
 * @docsCategory orders
 */
export declare class ActiveOrderService {
    private sessionService;
    private orderService;
    private connection;
    constructor(sessionService: SessionService, orderService: OrderService, connection: TransactionalConnection);
    /**
     * @description
     * Gets the active Order object from the current Session. Optionally can create a new Order if
     * no active Order exists.
     *
     * Intended to be used at the Resolver layer for those resolvers that depend upon an active Order
     * being present.
     */
    getOrderFromContext(ctx: RequestContext): Promise<Order | undefined>;
    getOrderFromContext(ctx: RequestContext, createIfNotExists: true): Promise<Order>;
}
