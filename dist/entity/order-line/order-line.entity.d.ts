import { Adjustment, AdjustmentType, Discount, TaxLine } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { Asset } from '../asset/asset.entity';
import { VendureEntity } from '../base/base.entity';
import { CustomOrderLineFields } from '../custom-entity-fields';
import { OrderItem } from '../order-item/order-item.entity';
import { Order } from '../order/order.entity';
import { ProductVariant } from '../product-variant/product-variant.entity';
import { TaxCategory } from '../tax-category/tax-category.entity';
/**
 * @description
 * A single line on an {@link Order} which contains one or more {@link OrderItem}s.
 *
 * @docsCategory entities
 */
export declare class OrderLine extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<OrderLine>);
    productVariant: ProductVariant;
    taxCategory: TaxCategory;
    featuredAsset: Asset;
    items: OrderItem[];
    order: Order;
    customFields: CustomOrderLineFields;
    get unitPrice(): number;
    get unitPriceWithTax(): number;
    get unitPriceChangeSinceAdded(): number;
    get unitPriceWithTaxChangeSinceAdded(): number;
    get discountedUnitPrice(): number;
    get discountedUnitPriceWithTax(): number;
    get proratedUnitPrice(): number;
    get proratedUnitPriceWithTax(): number;
    get quantity(): number;
    get adjustments(): Adjustment[];
    get taxLines(): TaxLine[];
    get taxRate(): number;
    get linePrice(): number;
    get linePriceWithTax(): number;
    get discountedLinePrice(): number;
    get discountedLinePriceWithTax(): number;
    get discounts(): Discount[];
    get lineTax(): number;
    get proratedLinePrice(): number;
    get proratedLinePriceWithTax(): number;
    get proratedLineTax(): number;
    /**
     * Returns all non-cancelled OrderItems on this line.
     */
    get activeItems(): OrderItem[];
    /**
     * Returns the first OrderItems of the line (i.e. the one with the earliest
     * `createdAt` property).
     */
    get firstItem(): OrderItem | undefined;
    /**
     * Clears Adjustments from all OrderItems of the given type. If no type
     * is specified, then all adjustments are removed.
     */
    clearAdjustments(type?: AdjustmentType): void;
    private firstActiveItemPropOr;
}
