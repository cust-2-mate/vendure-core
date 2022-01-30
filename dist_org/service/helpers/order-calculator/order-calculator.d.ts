import { RequestContext } from '../../../api/common/request-context';
import { RequestContextCacheService } from '../../../cache/request-context-cache.service';
import { ConfigService } from '../../../config/config.service';
import { OrderItem, OrderLine } from '../../../entity';
import { Order } from '../../../entity/order/order.entity';
import { Promotion } from '../../../entity/promotion/promotion.entity';
import { ShippingMethodService } from '../../services/shipping-method.service';
import { TaxRateService } from '../../services/tax-rate.service';
import { ZoneService } from '../../services/zone.service';
import { ShippingCalculator } from '../shipping-calculator/shipping-calculator';
export declare class OrderCalculator {
    private configService;
    private zoneService;
    private taxRateService;
    private shippingMethodService;
    private shippingCalculator;
    private requestContextCache;
    constructor(configService: ConfigService, zoneService: ZoneService, taxRateService: TaxRateService, shippingMethodService: ShippingMethodService, shippingCalculator: ShippingCalculator, requestContextCache: RequestContextCacheService);
    /**
     * Applies taxes and promotions to an Order. Mutates the order object.
     * Returns an array of any OrderItems which had new adjustments
     * applied, either tax or promotions.
     */
    applyPriceAdjustments(ctx: RequestContext, order: Order, promotions: Promotion[], updatedOrderLines?: OrderLine[], options?: {
        recalculateShipping?: boolean;
    }): Promise<OrderItem[]>;
    /**
     * Applies the correct TaxRate to each OrderItem in the order.
     */
    private applyTaxes;
    /**
     * Applies the correct TaxRate to an OrderLine
     */
    private applyTaxesToOrderLine;
    /**
     * Returns a memoized function for performing an efficient
     * lookup of the correct TaxRate for a given TaxCategory.
     */
    private createTaxRateGetter;
    /**
     * Applies any eligible promotions to each OrderItem in the order. Returns an array of
     * any OrderItems which had their Adjustments modified.
     */
    private applyPromotions;
    /**
     * Applies promotions to OrderItems. This is a quite complex function, due to the inherent complexity
     * of applying the promotions, and also due to added complexity in the name of performance
     * optimization. Therefore it is heavily annotated so that the purpose of each step is clear.
     */
    private applyOrderItemPromotions;
    /**
     * An OrderLine may have promotion adjustments from Promotions which are no longer applicable.
     * For example, a coupon code might have caused a discount to be applied, and now that code has
     * been removed from the order. The adjustment will still be there on each OrderItem it was applied
     * to, even though that Promotion is no longer found in the `applicablePromotions` array.
     *
     * We need to know about this because it means that all OrderItems in the OrderLine must be
     * updated.
     */
    private orderLineHasInapplicablePromotions;
    private applyOrderPromotions;
    private applyShippingPromotions;
    private applyShipping;
    private calculateOrderTotals;
}
