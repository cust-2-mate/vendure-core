import { PaymentMetadata } from '../../../common/types/common-types';
import { Payment } from '../../../entity/payment/payment.entity';
import { Refund } from '../../../entity/refund/refund.entity';
import { PaymentService } from '../../../service';
import { OrderService } from '../../../service/services/order.service';
import { ApiType } from '../../common/get-api-type';
import { RequestContext } from '../../common/request-context';
export declare class PaymentEntityResolver {
    private orderService;
    constructor(orderService: OrderService);
    refunds(ctx: RequestContext, payment: Payment): Promise<Refund[]>;
    metadata(apiType: ApiType, payment: Payment): PaymentMetadata;
}
export declare class PaymentAdminEntityResolver {
    private paymentService;
    constructor(paymentService: PaymentService);
    nextStates(payment: Payment): Promise<readonly import("../../../service").PaymentState[]>;
}
