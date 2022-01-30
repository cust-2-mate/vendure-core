import { StockMovementListOptions } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ShippingCalculator } from '../../config/shipping-method/shipping-calculator';
import { ShippingEligibilityChecker } from '../../config/shipping-method/shipping-eligibility-checker';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { OrderItem } from '../../entity/order-item/order-item.entity';
import { OrderLine } from '../../entity/order-line/order-line.entity';
import { Order } from '../../entity/order/order.entity';
import { Allocation } from '../../entity/stock-movement/allocation.entity';
import { Cancellation } from '../../entity/stock-movement/cancellation.entity';
import { Release } from '../../entity/stock-movement/release.entity';
import { Sale } from '../../entity/stock-movement/sale.entity';
import { StockAdjustment } from '../../entity/stock-movement/stock-adjustment.entity';
import { StockMovement } from '../../entity/stock-movement/stock-movement.entity';
import { EventBus } from '../../event-bus/event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { GlobalSettingsService } from './global-settings.service';
/**
 * @description
 * Contains methods relating to {@link StockMovement} entities.
 *
 * @docsCategory services
 */
export declare class StockMovementService {
    private connection;
    private listQueryBuilder;
    private globalSettingsService;
    private eventBus;
    shippingEligibilityCheckers: ShippingEligibilityChecker[];
    shippingCalculators: ShippingCalculator[];
    private activeShippingMethods;
    constructor(connection: TransactionalConnection, listQueryBuilder: ListQueryBuilder, globalSettingsService: GlobalSettingsService, eventBus: EventBus);
    /**
     * @description
     * Returns a {@link PaginatedList} of all StockMovements associated with the specified ProductVariant.
     */
    getStockMovementsByProductVariantId(ctx: RequestContext, productVariantId: ID, options: StockMovementListOptions): Promise<PaginatedList<StockMovement>>;
    /**
     * @description
     * Adjusts the stock level of the ProductVariant, creating a new {@link StockAdjustment} entity
     * in the process.
     */
    adjustProductVariantStock(ctx: RequestContext, productVariantId: ID, oldStockLevel: number, newStockLevel: number): Promise<StockAdjustment | undefined>;
    /**
     * @description
     * Creates a new {@link Allocation} for each OrderLine in the Order. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * increased, indicating that this quantity of stock is allocated and cannot be sold.
     */
    createAllocationsForOrder(ctx: RequestContext, order: Order): Promise<Allocation[]>;
    /**
     * @description
     * Creates a new {@link Allocation} for each of the given OrderLines. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * increased, indicating that this quantity of stock is allocated and cannot be sold.
     */
    createAllocationsForOrderLines(ctx: RequestContext, lines: Array<{
        orderLine: OrderLine;
        quantity: number;
    }>): Promise<Allocation[]>;
    /**
     * @description
     * Creates {@link Sale}s for each OrderLine in the Order. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * reduced and the `stockOnHand` value is also reduced the the OrderLine quantity, indicating
     * that the stock is no longer allocated, but is actually sold and no longer available.
     */
    createSalesForOrder(ctx: RequestContext, orderItems: OrderItem[]): Promise<Sale[]>;
    /**
     * @description
     * Creates a {@link Cancellation} for each of the specified OrderItems. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockOnHand` value is
     * increased for each Cancellation, allowing that stock to be sold again.
     */
    createCancellationsForOrderItems(ctx: RequestContext, items: OrderItem[]): Promise<Cancellation[]>;
    /**
     * @description
     * Creates a {@link Release} for each of the specified OrderItems. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * reduced, indicating that this stock is once again available to buy.
     */
    createReleasesForOrderItems(ctx: RequestContext, items: OrderItem[]): Promise<Release[]>;
    private trackInventoryForVariant;
}
