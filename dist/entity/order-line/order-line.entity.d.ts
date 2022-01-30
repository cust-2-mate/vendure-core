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
    /**
     * @description
     * The price of a single unit, excluding tax and discounts.
     */
    get unitPrice(): number;
    /**
     * @description
     * The price of a single unit, including tax but excluding discounts.
     */
    get unitPriceWithTax(): number;
    /**
     * @description
     * Non-zero if the `unitPrice` has changed since it was initially added to Order.
     */
    get unitPriceChangeSinceAdded(): number;
    /**
     * @description
     * Non-zero if the `unitPriceWithTax` has changed since it was initially added to Order.
     */
    get unitPriceWithTaxChangeSinceAdded(): number;
    /**
     * @description
     * The price of a single unit including discounts, excluding tax.
     *
     * If Order-level discounts have been applied, this will not be the
     * actual taxable unit price (see `proratedUnitPrice`), but is generally the
     * correct price to display to customers to avoid confusion
     * about the internal handling of distributed Order-level discounts.
     */
    get discountedUnitPrice(): number;
    /**
     * @description
     * The price of a single unit including discounts and tax
     */
    get discountedUnitPriceWithTax(): number;
    /**
     * @description
     * The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
     * Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
     * and refund calculations.
     */
    get proratedUnitPrice(): number;
    /**
     * @description
     * The `proratedUnitPrice` including tax.
     */
    get proratedUnitPriceWithTax(): number;
    get quantity(): number;
    get adjustments(): Adjustment[];
    get taxLines(): TaxLine[];
    get taxRate(): number;
    /**
     * @description
     * The total price of the line excluding tax and discounts.
     */
    get linePrice(): number;
    /**
     * @description
     * The total price of the line including tax but excluding discounts.
     */
    get linePriceWithTax(): number;
    /**
     * @description
     * The price of the line including discounts, excluding tax.
     */
    get discountedLinePrice(): number;
    /**
     * @description
     * The price of the line including discounts and tax.
     */
    get discountedLinePriceWithTax(): number;
    get discounts(): Discount[];
    /**
     * @description
     * The total tax on this line.
     */
    get lineTax(): number;
    /**
     * @description
     * The actual line price, taking into account both item discounts _and_ prorated (proportionally-distributed)
     * Order-level discounts. This value is the true economic value of the OrderLine, and is used in tax
     * and refund calculations.
     */
    get proratedLinePrice(): number;
    /**
     * @description
     * The `proratedLinePrice` including tax.
     */
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
