import { RequestContext } from '../../../api/common/request-context';
import { RequestContextCacheService } from '../../../cache/request-context-cache.service';
import { ConfigService } from '../../../config/config.service';
import { Order } from '../../../entity/order/order.entity';
import { ProductVariant } from '../../../entity/product-variant/product-variant.entity';
import { TaxRateService } from '../../services/tax-rate.service';
import { ZoneService } from '../../services/zone.service';
/**
 * @description
 * This helper is used to apply the correct price to a ProductVariant based on the current context
 * including active Channel, any current Order, etc.
 */
export declare class ProductPriceApplicator {
    private configService;
    private taxRateService;
    private zoneService;
    private requestCache;
    constructor(configService: ConfigService, taxRateService: TaxRateService, zoneService: ZoneService, requestCache: RequestContextCacheService);
    /**
     * @description
     * Populates the `price` field with the price for the specified channel.
     */
    applyChannelPriceAndTax(variant: ProductVariant, ctx: RequestContext, order?: Order): Promise<ProductVariant>;
}
