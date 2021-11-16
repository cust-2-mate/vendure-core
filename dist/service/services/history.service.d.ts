import { UpdateCustomerInput as UpdateCustomerShopInput } from '@vendure/common/lib/generated-shop-types';
import { HistoryEntryListOptions, HistoryEntryType, UpdateAddressInput, UpdateCustomerInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { CustomerHistoryEntry } from '../../entity/history-entry/customer-history-entry.entity';
import { OrderHistoryEntry } from '../../entity/history-entry/order-history-entry.entity';
import { FulfillmentState } from '../helpers/fulfillment-state-machine/fulfillment-state';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { OrderState } from '../helpers/order-state-machine/order-state';
import { PaymentState } from '../helpers/payment-state-machine/payment-state';
import { RefundState } from '../helpers/refund-state-machine/refund-state';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { AdministratorService } from './administrator.service';
export declare type CustomerHistoryEntryData = {
    [HistoryEntryType.CUSTOMER_REGISTERED]: {
        strategy: string;
    };
    [HistoryEntryType.CUSTOMER_VERIFIED]: {
        strategy: string;
    };
    [HistoryEntryType.CUSTOMER_DETAIL_UPDATED]: {
        input: UpdateCustomerInput | UpdateCustomerShopInput;
    };
    [HistoryEntryType.CUSTOMER_ADDRESS_CREATED]: {
        address: string;
    };
    [HistoryEntryType.CUSTOMER_ADDED_TO_GROUP]: {
        groupName: string;
    };
    [HistoryEntryType.CUSTOMER_REMOVED_FROM_GROUP]: {
        groupName: string;
    };
    [HistoryEntryType.CUSTOMER_ADDRESS_UPDATED]: {
        address: string;
        input: UpdateAddressInput;
    };
    [HistoryEntryType.CUSTOMER_ADDRESS_DELETED]: {
        address: string;
    };
    [HistoryEntryType.CUSTOMER_PASSWORD_UPDATED]: {};
    [HistoryEntryType.CUSTOMER_PASSWORD_RESET_REQUESTED]: {};
    [HistoryEntryType.CUSTOMER_PASSWORD_RESET_VERIFIED]: {};
    [HistoryEntryType.CUSTOMER_EMAIL_UPDATE_REQUESTED]: {
        oldEmailAddress: string;
        newEmailAddress: string;
    };
    [HistoryEntryType.CUSTOMER_EMAIL_UPDATE_VERIFIED]: {
        oldEmailAddress: string;
        newEmailAddress: string;
    };
    [HistoryEntryType.CUSTOMER_NOTE]: {
        note: string;
    };
};
export declare type OrderHistoryEntryData = {
    [HistoryEntryType.ORDER_STATE_TRANSITION]: {
        from: OrderState;
        to: OrderState;
    };
    [HistoryEntryType.ORDER_PAYMENT_TRANSITION]: {
        paymentId: ID;
        from: PaymentState;
        to: PaymentState;
    };
    [HistoryEntryType.ORDER_FULFILLMENT_TRANSITION]: {
        fulfillmentId: ID;
        from: FulfillmentState;
        to: FulfillmentState;
    };
    [HistoryEntryType.ORDER_FULFILLMENT]: {
        fulfillmentId: ID;
    };
    [HistoryEntryType.ORDER_CANCELLATION]: {
        orderItemIds: ID[];
        reason?: string;
    };
    [HistoryEntryType.ORDER_REFUND_TRANSITION]: {
        refundId: ID;
        from: RefundState;
        to: RefundState;
        reason?: string;
    };
    [HistoryEntryType.ORDER_NOTE]: {
        note: string;
    };
    [HistoryEntryType.ORDER_COUPON_APPLIED]: {
        couponCode: string;
        promotionId: ID;
    };
    [HistoryEntryType.ORDER_COUPON_REMOVED]: {
        couponCode: string;
    };
    [HistoryEntryType.ORDER_MODIFIED]: {
        modificationId: ID;
    };
};
export interface CreateCustomerHistoryEntryArgs<T extends keyof CustomerHistoryEntryData> {
    customerId: ID;
    ctx: RequestContext;
    type: T;
    data: CustomerHistoryEntryData[T];
}
export interface CreateOrderHistoryEntryArgs<T extends keyof OrderHistoryEntryData> {
    orderId: ID;
    ctx: RequestContext;
    type: T;
    data: OrderHistoryEntryData[T];
}
export interface UpdateOrderHistoryEntryArgs<T extends keyof OrderHistoryEntryData> {
    entryId: ID;
    ctx: RequestContext;
    type: T;
    isPublic?: boolean;
    data?: OrderHistoryEntryData[T];
}
export interface UpdateCustomerHistoryEntryArgs<T extends keyof CustomerHistoryEntryData> {
    entryId: ID;
    ctx: RequestContext;
    type: T;
    data?: CustomerHistoryEntryData[T];
}
/**
 * The HistoryService is reponsible for creating and retrieving HistoryEntry entities.
 */
export declare class HistoryService {
    private connection;
    private administratorService;
    private listQueryBuilder;
    constructor(connection: TransactionalConnection, administratorService: AdministratorService, listQueryBuilder: ListQueryBuilder);
    getHistoryForOrder(ctx: RequestContext, orderId: ID, publicOnly: boolean, options?: HistoryEntryListOptions): Promise<PaginatedList<OrderHistoryEntry>>;
    createHistoryEntryForOrder<T extends keyof OrderHistoryEntryData>(args: CreateOrderHistoryEntryArgs<T>, isPublic?: boolean): Promise<OrderHistoryEntry>;
    getHistoryForCustomer(ctx: RequestContext, customerId: ID, publicOnly: boolean, options?: HistoryEntryListOptions): Promise<PaginatedList<CustomerHistoryEntry>>;
    createHistoryEntryForCustomer<T extends keyof CustomerHistoryEntryData>(args: CreateCustomerHistoryEntryArgs<T>, isPublic?: boolean): Promise<CustomerHistoryEntry>;
    updateOrderHistoryEntry<T extends keyof OrderHistoryEntryData>(ctx: RequestContext, args: UpdateOrderHistoryEntryArgs<T>): Promise<OrderHistoryEntry>;
    deleteOrderHistoryEntry(ctx: RequestContext, id: ID): Promise<void>;
    updateCustomerHistoryEntry<T extends keyof CustomerHistoryEntryData>(ctx: RequestContext, args: UpdateCustomerHistoryEntryArgs<T>): Promise<CustomerHistoryEntry>;
    deleteCustomerHistoryEntry(ctx: RequestContext, id: ID): Promise<void>;
    private getAdministratorFromContext;
}
