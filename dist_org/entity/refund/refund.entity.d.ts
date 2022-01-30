import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { PaymentMetadata } from '../../common/types/common-types';
import { RefundState } from '../../service/helpers/refund-state-machine/refund-state';
import { VendureEntity } from '../base/base.entity';
import { OrderItem } from '../order-item/order-item.entity';
import { Payment } from '../payment/payment.entity';
export declare class Refund extends VendureEntity {
    constructor(input?: DeepPartial<Refund>);
    items: number;
    shipping: number;
    adjustment: number;
    total: number;
    method: string;
    reason: string;
    state: RefundState;
    transactionId: string;
    orderItems: OrderItem[];
    payment: Payment;
    paymentId: ID;
    metadata: PaymentMetadata;
}
