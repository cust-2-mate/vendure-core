import { Adjustment, Discount, TaxLine } from '@vendure/common/lib/generated-types';
import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { Order } from '../order/order.entity';
import { ShippingMethod } from '../shipping-method/shipping-method.entity';
export declare class ShippingLine extends VendureEntity {
    constructor(input?: DeepPartial<ShippingLine>);
    shippingMethodId: ID | null;
    shippingMethod: ShippingMethod | null;
    order: Order;
    listPrice: number;
    listPriceIncludesTax: boolean;
    adjustments: Adjustment[];
    taxLines: TaxLine[];
    get price(): number;
    get priceWithTax(): number;
    get discountedPrice(): number;
    get discountedPriceWithTax(): number;
    get taxRate(): number;
    get discounts(): Discount[];
    addAdjustment(adjustment: Adjustment): void;
    /**
     * @description
     * The total of all price adjustments. Will typically be a negative number due to discounts.
     */
    private getAdjustmentsTotal;
}
