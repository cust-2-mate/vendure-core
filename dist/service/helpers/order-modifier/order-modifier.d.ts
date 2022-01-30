import { ModifyOrderInput, ModifyOrderResult } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../../api/common/request-context';
import { JustErrorResults } from '../../../common/error/error-result';
import { ConfigService } from '../../../config/config.service';
import { TransactionalConnection } from '../../../connection/transactional-connection';
import { OrderLine } from '../../../entity/order-line/order-line.entity';
import { OrderModification } from '../../../entity/order-modification/order-modification.entity';
import { Order } from '../../../entity/order/order.entity';
import { ProductVariant } from '../../../entity/product-variant/product-variant.entity';
import { CountryService } from '../../services/country.service';
import { PaymentService } from '../../services/payment.service';
import { ProductVariantService } from '../../services/product-variant.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { CustomFieldRelationService } from '../custom-field-relation/custom-field-relation.service';
import { OrderCalculator } from '../order-calculator/order-calculator';
/**
 * @description
 * This helper is responsible for modifying the contents of an Order.
 *
 * Note:
 * There is not a clear separation of concerns between the OrderService and this, since
 * the OrderService also contains some method which modify the Order (e.g. removeItemFromOrder).
 * So this helper was mainly extracted to isolate the huge `modifyOrder` method since the
 * OrderService was just growing too large. Future refactoring could improve the organization
 * of these Order-related methods into a more clearly-delineated set of classes.
 */
export declare class OrderModifier {
    private connection;
    private configService;
    private orderCalculator;
    private paymentService;
    private countryService;
    private stockMovementService;
    private productVariantService;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, configService: ConfigService, orderCalculator: OrderCalculator, paymentService: PaymentService, countryService: CountryService, stockMovementService: StockMovementService, productVariantService: ProductVariantService, customFieldRelationService: CustomFieldRelationService);
    /**
     * Ensure that the ProductVariant has sufficient saleable stock to add the given
     * quantity to an Order.
     */
    constrainQuantityToSaleable(ctx: RequestContext, variant: ProductVariant, quantity: number, existingQuantity?: number): Promise<number>;
    getExistingOrderLine(ctx: RequestContext, order: Order, productVariantId: ID, customFields?: {
        [key: string]: any;
    }): Promise<OrderLine | undefined>;
    /**
     * Returns the OrderLine to which a new OrderItem belongs, creating a new OrderLine
     * if no existing line is found.
     */
    getOrCreateOrderLine(ctx: RequestContext, order: Order, productVariantId: ID, customFields?: {
        [key: string]: any;
    }): Promise<OrderLine>;
    /**
     * Updates the quantity of an OrderLine, taking into account the available saleable stock level.
     * Returns the actual quantity that the OrderLine was updated to (which may be less than the
     * `quantity` argument if insufficient stock was available.
     */
    updateOrderLineQuantity(ctx: RequestContext, orderLine: OrderLine, quantity: number, order: Order): Promise<OrderLine>;
    modifyOrder(ctx: RequestContext, input: ModifyOrderInput, order: Order): Promise<JustErrorResults<ModifyOrderResult> | {
        order: Order;
        modification: OrderModification;
    }>;
    private noChangesSpecified;
    private getOrderPayments;
    private customFieldsAreEqual;
    private getProductVariantOrThrow;
}
