import { OrderHistoryArgs } from '@vendure/common/lib/generated-types';
import { Order } from '../../../entity/order/order.entity';
import { HistoryService } from '../../../service/services/history.service';
import { OrderService } from '../../../service/services/order.service';
import { ShippingMethodService } from '../../../service/services/shipping-method.service';
import { ApiType } from '../../common/get-api-type';
import { RequestContext } from '../../common/request-context';
export declare class OrderEntityResolver {
    private orderService;
    private shippingMethodService;
    private historyService;
    constructor(orderService: OrderService, shippingMethodService: ShippingMethodService, historyService: HistoryService);
    payments(ctx: RequestContext, order: Order): Promise<import("../../..").Payment[]>;
    fulfillments(ctx: RequestContext, order: Order): Promise<import("../../../entity/fulfillment/fulfillment.entity").Fulfillment[]>;
    surcharges(ctx: RequestContext, order: Order): Promise<import("../../..").Surcharge[]>;
    lines(ctx: RequestContext, order: Order): Promise<import("../../..").OrderLine[]>;
    history(ctx: RequestContext, apiType: ApiType, order: Order, args: OrderHistoryArgs): Promise<import("@vendure/common/lib/shared-types").PaginatedList<import("../../../entity/history-entry/order-history-entry.entity").OrderHistoryEntry>>;
    promotions(ctx: RequestContext, order: Order): Promise<import("../../..").Promotion[]>;
}
export declare class OrderAdminEntityResolver {
    private orderService;
    constructor(orderService: OrderService);
    modifications(ctx: RequestContext, order: Order): Promise<import("../../../entity/order-modification/order-modification.entity").OrderModification[]>;
    nextStates(order: Order): Promise<readonly import("../../..").OrderState[]>;
}
