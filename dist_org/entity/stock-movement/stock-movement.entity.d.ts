import { StockMovementType } from '@vendure/common/lib/generated-types';
import { VendureEntity } from '../base/base.entity';
import { ProductVariant } from '../product-variant/product-variant.entity';
/**
 * @description
 * A StockMovement is created whenever stock of a particular ProductVariant goes in
 * or out.
 *
 * @docsCategory entities
 * @docsPage StockMovement
 * @docsWeight 0
 */
export declare abstract class StockMovement extends VendureEntity {
    readonly type: StockMovementType;
    productVariant: ProductVariant;
    quantity: number;
}
