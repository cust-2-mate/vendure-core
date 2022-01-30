import { AddPaymentToOrderResult, ApplyCouponCodeResult, PaymentInput, PaymentMethodQuote, RemoveOrderItemsResult, SetOrderShippingMethodResult, UpdateOrderItemsResult } from '@vendure/common/lib/generated-shop-types';
import { AddFulfillmentToOrderResult, AddManualPaymentToOrderResult, AddNoteToOrderInput, CancelOrderInput, CancelOrderResult, CreateAddressInput, DeletionResponse, FulfillOrderInput, ManualPaymentInput, ModifyOrderInput, ModifyOrderResult, OrderListOptions, OrderProcessState, RefundOrderInput, RefundOrderResult, SettlePaymentResult, SettleRefundInput, ShippingMethodQuote, TransitionPaymentToStateResult, UpdateOrderNoteInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion } from '../../common/error/error-result';
import { FulfillmentStateTransitionError } from '../../common/error/generated-graphql-admin-errors';
import { OrderStateTransitionError } from '../../common/error/generated-graphql-shop-errors';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { Customer } from '../../entity/customer/customer.entity';
import { Fulfillment } from '../../entity/fulfillment/fulfillment.entity';
import { HistoryEntry } from '../../entity/history-entry/history-entry.entity';
import { OrderItem } from '../../entity/order-item/order-item.entity';
import { OrderModification } from '../../entity/order-modification/order-modification.entity';
import { Order } from '../../entity/order/order.entity';
import { Payment } from '../../entity/payment/payment.entity';
import { Promotion } from '../../entity/promotion/promotion.entity';
import { Refund } from '../../entity/refund/refund.entity';
import { Surcharge } from '../../entity/surcharge/surcharge.entity';
import { User } from '../../entity/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { FulfillmentState } from '../helpers/fulfillment-state-machine/fulfillment-state';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { OrderCalculator } from '../helpers/order-calculator/order-calculator';
import { OrderMerger } from '../helpers/order-merger/order-merger';
import { OrderModifier } from '../helpers/order-modifier/order-modifier';
import { OrderState } from '../helpers/order-state-machine/order-state';
import { OrderStateMachine } from '../helpers/order-state-machine/order-state-machine';
import { PaymentState } from '../helpers/payment-state-machine/payment-state';
import { PaymentStateMachine } from '../helpers/payment-state-machine/payment-state-machine';
import { RefundStateMachine } from '../helpers/refund-state-machine/refund-state-machine';
import { ShippingCalculator } from '../helpers/shipping-calculator/shipping-calculator';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
import { CountryService } from './country.service';
import { CustomerService } from './customer.service';
import { FulfillmentService } from './fulfillment.service';
import { HistoryService } from './history.service';
import { PaymentMethodService } from './payment-method.service';
import { PaymentService } from './payment.service';
import { ProductVariantService } from './product-variant.service';
import { PromotionService } from './promotion.service';
import { StockMovementService } from './stock-movement.service';
export declare class OrderService {
    private connection;
    private configService;
    private productVariantService;
    private customerService;
    private countryService;
    private orderCalculator;
    private shippingCalculator;
    private orderStateMachine;
    private orderMerger;
    private paymentService;
    private paymentStateMachine;
    private paymentMethodService;
    private fulfillmentService;
    private listQueryBuilder;
    private stockMovementService;
    private refundStateMachine;
    private historyService;
    private promotionService;
    private eventBus;
    private channelService;
    private orderModifier;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, configService: ConfigService, productVariantService: ProductVariantService, customerService: CustomerService, countryService: CountryService, orderCalculator: OrderCalculator, shippingCalculator: ShippingCalculator, orderStateMachine: OrderStateMachine, orderMerger: OrderMerger, paymentService: PaymentService, paymentStateMachine: PaymentStateMachine, paymentMethodService: PaymentMethodService, fulfillmentService: FulfillmentService, listQueryBuilder: ListQueryBuilder, stockMovementService: StockMovementService, refundStateMachine: RefundStateMachine, historyService: HistoryService, promotionService: PromotionService, eventBus: EventBus, channelService: ChannelService, orderModifier: OrderModifier, customFieldRelationService: CustomFieldRelationService);
    getOrderProcessStates(): OrderProcessState[];
    findAll(ctx: RequestContext, options?: OrderListOptions): Promise<PaginatedList<Order>>;
    findOne(ctx: RequestContext, orderId: ID): Promise<Order | undefined>;
    findOneByCode(ctx: RequestContext, orderCode: string): Promise<Order | undefined>;
    findByCustomerId(ctx: RequestContext, customerId: ID, options?: ListQueryOptions<Order>): Promise<PaginatedList<Order>>;
    getOrderPayments(ctx: RequestContext, orderId: ID): Promise<Payment[]>;
    getRefundOrderItems(ctx: RequestContext, refundId: ID): Promise<OrderItem[]>;
    getOrderModifications(ctx: RequestContext, orderId: ID): Promise<OrderModification[]>;
    getPaymentRefunds(ctx: RequestContext, paymentId: ID): Promise<Refund[]>;
    getActiveOrderForUser(ctx: RequestContext, userId: ID): Promise<Order | undefined>;
    create(ctx: RequestContext, userId?: ID): Promise<Order>;
    updateCustomFields(ctx: RequestContext, orderId: ID, customFields: any): Promise<Order>;
    /**
     * Adds an OrderItem to the Order, either creating a new OrderLine or
     * incrementing an existing one.
     */
    addItemToOrder(ctx: RequestContext, orderId: ID, productVariantId: ID, quantity: number, customFields?: {
        [key: string]: any;
    }): Promise<ErrorResultUnion<UpdateOrderItemsResult, Order>>;
    /**
     * Adjusts the quantity of an existing OrderLine
     */
    adjustOrderLine(ctx: RequestContext, orderId: ID, orderLineId: ID, quantity: number, customFields?: {
        [key: string]: any;
    }): Promise<ErrorResultUnion<UpdateOrderItemsResult, Order>>;
    removeItemFromOrder(ctx: RequestContext, orderId: ID, orderLineId: ID): Promise<ErrorResultUnion<RemoveOrderItemsResult, Order>>;
    removeAllItemsFromOrder(ctx: RequestContext, orderId: ID): Promise<ErrorResultUnion<RemoveOrderItemsResult, Order>>;
    addSurchargeToOrder(ctx: RequestContext, orderId: ID, surchargeInput: Partial<Omit<Surcharge, 'id' | 'createdAt' | 'updatedAt' | 'order'>>): Promise<Order>;
    removeSurchargeFromOrder(ctx: RequestContext, orderId: ID, surchargeId: ID): Promise<Order>;
    applyCouponCode(ctx: RequestContext, orderId: ID, couponCode: string): Promise<ErrorResultUnion<ApplyCouponCodeResult, Order>>;
    removeCouponCode(ctx: RequestContext, orderId: ID, couponCode: string): Promise<Order>;
    getOrderPromotions(ctx: RequestContext, orderId: ID): Promise<Promotion[]>;
    getNextOrderStates(order: Order): ReadonlyArray<OrderState>;
    setShippingAddress(ctx: RequestContext, orderId: ID, input: CreateAddressInput): Promise<Order>;
    setBillingAddress(ctx: RequestContext, orderId: ID, input: CreateAddressInput): Promise<Order>;
    getEligibleShippingMethods(ctx: RequestContext, orderId: ID): Promise<ShippingMethodQuote[]>;
    getEligiblePaymentMethods(ctx: RequestContext, orderId: ID): Promise<PaymentMethodQuote[]>;
    setShippingMethod(ctx: RequestContext, orderId: ID, shippingMethodId: ID): Promise<ErrorResultUnion<SetOrderShippingMethodResult, Order>>;
    transitionToState(ctx: RequestContext, orderId: ID, state: OrderState): Promise<Order | OrderStateTransitionError>;
    transitionFulfillmentToState(ctx: RequestContext, fulfillmentId: ID, state: FulfillmentState): Promise<Fulfillment | FulfillmentStateTransitionError>;
    modifyOrder(ctx: RequestContext, input: ModifyOrderInput): Promise<ErrorResultUnion<ModifyOrderResult, Order>>;
    private handleFulfillmentStateTransitByOrder;
    transitionPaymentToState(ctx: RequestContext, paymentId: ID, state: PaymentState): Promise<ErrorResultUnion<TransitionPaymentToStateResult, Payment>>;
    addPaymentToOrder(ctx: RequestContext, orderId: ID, input: PaymentInput): Promise<ErrorResultUnion<AddPaymentToOrderResult, Order>>;
    private transitionOrderIfTotalIsCovered;
    addManualPaymentToOrder(ctx: RequestContext, input: ManualPaymentInput): Promise<ErrorResultUnion<AddManualPaymentToOrderResult, Order>>;
    settlePayment(ctx: RequestContext, paymentId: ID): Promise<ErrorResultUnion<SettlePaymentResult, Payment>>;
    createFulfillment(ctx: RequestContext, input: FulfillOrderInput): Promise<ErrorResultUnion<AddFulfillmentToOrderResult, Fulfillment>>;
    private ensureSufficientStockForFulfillment;
    getOrderFulfillments(ctx: RequestContext, order: Order): Promise<Fulfillment[]>;
    getOrderSurcharges(ctx: RequestContext, orderId: ID): Promise<Surcharge[]>;
    cancelOrder(ctx: RequestContext, input: CancelOrderInput): Promise<ErrorResultUnion<CancelOrderResult, Order>>;
    private cancelOrderById;
    private cancelOrderByOrderLines;
    refundOrder(ctx: RequestContext, input: RefundOrderInput): Promise<ErrorResultUnion<RefundOrderResult, Refund>>;
    settleRefund(ctx: RequestContext, input: SettleRefundInput): Promise<Refund>;
    addCustomerToOrder(ctx: RequestContext, orderId: ID, customer: Customer): Promise<Order>;
    addNoteToOrder(ctx: RequestContext, input: AddNoteToOrderInput): Promise<Order>;
    updateOrderNote(ctx: RequestContext, input: UpdateOrderNoteInput): Promise<HistoryEntry>;
    deleteOrderNote(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    /**
     * When a guest user with an anonymous Order signs in and has an existing Order associated with that Customer,
     * we need to reconcile the contents of the two orders.
     */
    mergeOrders(ctx: RequestContext, user: User, guestOrder?: Order, existingOrder?: Order): Promise<Order | undefined>;
    private getOrderOrThrow;
    private getOrderLineOrThrow;
    /**
     * Returns error if quantity is negative.
     */
    private assertQuantityIsPositive;
    /**
     * Returns error if the Order is not in the "AddingItems" state.
     */
    private assertAddingItemsState;
    /**
     * Throws if adding the given quantity would take the total order items over the
     * maximum limit specified in the config.
     */
    private assertNotOverOrderItemsLimit;
    /**
     * Throws if adding the given quantity would exceed the maximum allowed
     * quantity for one order line.
     */
    private assertNotOverOrderLineItemsLimit;
    /**
     * Applies promotions, taxes and shipping to the Order.
     */
    private applyPriceAdjustments;
    private getOrderWithFulfillments;
    private getOrdersAndItemsFromLines;
    private mergePaymentMetadata;
}
