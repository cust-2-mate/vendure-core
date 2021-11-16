import { DeepPartial, ID } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { ProductVariant } from './product-variant.entity';
export declare class ProductVariantPrice extends VendureEntity {
    constructor(input?: DeepPartial<ProductVariantPrice>);
    price: number;
    channelId: ID;
    variant: ProductVariant;
}
