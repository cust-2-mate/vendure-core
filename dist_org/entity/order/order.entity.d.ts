import { CurrencyCode, Discount, OrderAddress, OrderTaxSummary } from '@vendure/common/lib/generated-types';
import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { ChannelAware } from '../../common/types/common-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { OrderState } from '../../service/helpers/order-state-machine/order-state';
import { VendureEntity } from '../base/base.entity';
import { Channel } from '../channel/channel.entity';
import { CustomOrderFields } from '../custom-entity-fields';
import { Customer } from '../customer/customer.entity';
import { OrderItem } from '../order-item/order-item.entity';
import { OrderLine } from '../order-line/order-line.entity';
import { OrderModification } from '../order-modification/order-modification.entity';
import { Payment } from '../payment/payment.entity';
import { Promotion } from '../promotion/promotion.entity';
import { ShippingLine } from '../shipping-line/shipping-line.entity';
import { Surcharge } from '../surcharge/surcharge.entity';
/**
 * @description
 * An Order is created whenever a {@link Customer} adds an item to the cart. It contains all the
 * information required to fulfill an order: which {@link ProductVariant}s in what quantities;
 * the shipping address and price; any applicable promotions; payments etc.
 *
 * An Order exists in a well-defined state according to the {@link OrderState} type. A state machine
 * is used to govern the transition from one state to another.
 *
 * @docsCategory entities
 */
export declare class Order extends VendureEntity implements ChannelAware, HasCustomFields {
    constructor(input?: DeepPartial<Order>);
    code: string;
    state: OrderState;
    active: boolean;
    orderPlacedAt?: Date;
    customer?: Customer;
    lines: OrderLine[];
    surcharges: Surcharge[];
    couponCodes: string[];
    promotions: Promotion[];
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    payments: Payment[];
    currencyCode: CurrencyCode;
    customFields: CustomOrderFields;
    taxZoneId?: ID;
    channels: Channel[];
    modifications: OrderModification[];
    subTotal: number;
    subTotalWithTax: number;
    shippingLines: ShippingLine[];
    shipping: number;
    shippingWithTax: number;
    get discounts(): Discount[];
    get total(): number;
    get totalWithTax(): number;
    get totalQuantity(): number;
    get taxSummary(): OrderTaxSummary[];
    getOrderItems(): OrderItem[];
}
