import { Adjustment, AdjustmentType, TaxLine } from '@vendure/common/lib/generated-types';
import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { Fulfillment } from '../fulfillment/fulfillment.entity';
import { OrderLine } from '../order-line/order-line.entity';
import { Refund } from '../refund/refund.entity';
import { Cancellation } from '../stock-movement/cancellation.entity';
/**
 * @description
 * An individual item of an {@link OrderLine}.
 *
 * @docsCategory entities
 */
export declare class OrderItem extends VendureEntity {
    constructor(input?: DeepPartial<OrderItem>);
    line: OrderLine;
    lineId: ID;
    /**
     * @description
     * The price as calculated when the OrderItem was first added to the Order. Usually will be identical to the
     * `listPrice`, except when the ProductVariant price has changed in the mean time and a re-calculation of
     * the Order has been performed.
     */
    initialListPrice: number;
    /**
     * @description
     * This is the price as listed by the ProductVariant (and possibly modified by the {@link OrderItemPriceCalculationStrategy}),
     * which, depending on the current Channel, may or may not include tax.
     */
    listPrice: number;
    /**
     * @description
     * Whether or not the listPrice includes tax, which depends on the settings
     * of the current Channel.
     */
    listPriceIncludesTax: boolean;
    adjustments: Adjustment[];
    taxLines: TaxLine[];
    fulfillments: Fulfillment[];
    refund: Refund;
    refundId: ID | null;
    cancellation: Cancellation;
    cancelled: boolean;
    get fulfillment(): Fulfillment | undefined;
    get unitPrice(): number;
    get unitPriceWithTax(): number;
    /**
     * @description
     * The total applicable tax rate, which is the sum of all taxLines on this
     * OrderItem.
     */
    get taxRate(): number;
    get unitTax(): number;
    get discountedUnitPrice(): number;
    get discountedUnitPriceWithTax(): number;
    get proratedUnitPrice(): number;
    get proratedUnitPriceWithTax(): number;
    get proratedUnitTax(): number;
    /**
     * @description
     * The total of all price adjustments. Will typically be a negative number due to discounts.
     */
    private getAdjustmentsTotal;
    addAdjustment(adjustment: Adjustment): void;
    clearAdjustments(type?: AdjustmentType): void;
}
