import { Fulfillment } from '../../../entity/fulfillment/fulfillment.entity';
import { FulfillmentService } from '../../../service/services/fulfillment.service';
import { RequestContext } from '../../common/request-context';
export declare class FulfillmentEntityResolver {
    private fulfillmentService;
    constructor(fulfillmentService: FulfillmentService);
    orderItems(ctx: RequestContext, fulfillment: Fulfillment): Promise<import("../../..").OrderItem[]>;
}
export declare class FulfillmentAdminEntityResolver {
    private fulfillmentService;
    constructor(fulfillmentService: FulfillmentService);
    nextStates(fulfillment: Fulfillment): Promise<readonly import("../../..").FulfillmentState[]>;
}
