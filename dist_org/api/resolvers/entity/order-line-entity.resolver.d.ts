import { Asset, OrderLine, ProductVariant } from '../../../entity';
import { AssetService, ProductVariantService } from '../../../service';
import { RequestContext } from '../../common/request-context';
export declare class OrderLineEntityResolver {
    private productVariantService;
    private assetService;
    constructor(productVariantService: ProductVariantService, assetService: AssetService);
    productVariant(ctx: RequestContext, orderLine: OrderLine): Promise<ProductVariant>;
    featuredAsset(ctx: RequestContext, orderLine: OrderLine): Promise<Asset | undefined>;
}
