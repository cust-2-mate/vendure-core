import { OrderItem } from '../../../entity/order-item/order-item.entity';
import { Refund } from '../../../entity/refund/refund.entity';
import { OrderService } from '../../../service/services/order.service';
import { RequestContext } from '../../common/request-context';
export declare class RefundEntityResolver {
    private orderService;
    constructor(orderService: OrderService);
    orderItems(ctx: RequestContext, refund: Refund): Promise<OrderItem[]>;
}
