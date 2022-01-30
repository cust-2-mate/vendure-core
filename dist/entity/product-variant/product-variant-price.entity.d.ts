import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { ProductVariant } from './product-variant.entity';
/**
 * @description
 * A ProductVariantPrice is a Channel-specific price for a ProductVariant. For every Channel to
 * which a ProductVariant is assigned, there will be a corresponding ProductVariantPrice entity.
 *
 * @docsCategory entities
 */
export declare class ProductVariantPrice extends VendureEntity {
    constructor(input?: DeepPartial<ProductVariantPrice>);
    price: number;
    channelId: ID;
    variant: ProductVariant;
}
