"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../common/error/errors");
const transactional_connection_1 = require("../../connection/transactional-connection");
const order_item_entity_1 = require("../../entity/order-item/order-item.entity");
const product_variant_entity_1 = require("../../entity/product-variant/product-variant.entity");
const allocation_entity_1 = require("../../entity/stock-movement/allocation.entity");
const cancellation_entity_1 = require("../../entity/stock-movement/cancellation.entity");
const release_entity_1 = require("../../entity/stock-movement/release.entity");
const sale_entity_1 = require("../../entity/stock-movement/sale.entity");
const stock_adjustment_entity_1 = require("../../entity/stock-movement/stock-adjustment.entity");
const stock_movement_entity_1 = require("../../entity/stock-movement/stock-movement.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const stock_movement_event_1 = require("../../event-bus/events/stock-movement-event");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const global_settings_service_1 = require("./global-settings.service");
/**
 * @description
 * Contains methods relating to {@link StockMovement} entities.
 *
 * @docsCategory services
 */
let StockMovementService = class StockMovementService {
    constructor(connection, listQueryBuilder, globalSettingsService, eventBus) {
        this.connection = connection;
        this.listQueryBuilder = listQueryBuilder;
        this.globalSettingsService = globalSettingsService;
        this.eventBus = eventBus;
    }
    /**
     * @description
     * Returns a {@link PaginatedList} of all StockMovements associated with the specified ProductVariant.
     */
    getStockMovementsByProductVariantId(ctx, productVariantId, options) {
        return this.listQueryBuilder
            .build(stock_movement_entity_1.StockMovement, options, { ctx })
            .leftJoin('stockmovement.productVariant', 'productVariant')
            .andWhere('productVariant.id = :productVariantId', { productVariantId })
            .getManyAndCount()
            .then(async ([items, totalItems]) => {
            return {
                items,
                totalItems,
            };
        });
    }
    /**
     * @description
     * Adjusts the stock level of the ProductVariant, creating a new {@link StockAdjustment} entity
     * in the process.
     */
    async adjustProductVariantStock(ctx, productVariantId, oldStockLevel, newStockLevel) {
        if (oldStockLevel === newStockLevel) {
            return;
        }
        const delta = newStockLevel - oldStockLevel;
        const adjustment = await this.connection.getRepository(ctx, stock_adjustment_entity_1.StockAdjustment).save(new stock_adjustment_entity_1.StockAdjustment({
            quantity: delta,
            productVariant: { id: productVariantId },
        }));
        this.eventBus.publish(new stock_movement_event_1.StockMovementEvent(ctx, [adjustment]));
        return adjustment;
    }
    /**
     * @description
     * Creates a new {@link Allocation} for each OrderLine in the Order. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * increased, indicating that this quantity of stock is allocated and cannot be sold.
     */
    async createAllocationsForOrder(ctx, order) {
        if (order.active !== false) {
            throw new errors_1.InternalServerError('error.cannot-create-allocations-for-active-order');
        }
        const lines = order.lines.map(orderLine => ({ orderLine, quantity: orderLine.quantity }));
        return this.createAllocationsForOrderLines(ctx, lines);
    }
    /**
     * @description
     * Creates a new {@link Allocation} for each of the given OrderLines. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * increased, indicating that this quantity of stock is allocated and cannot be sold.
     */
    async createAllocationsForOrderLines(ctx, lines) {
        const allocations = [];
        const globalTrackInventory = (await this.globalSettingsService.getSettings(ctx)).trackInventory;
        for (const { orderLine, quantity } of lines) {
            const productVariant = await this.connection.getEntityOrThrow(ctx, product_variant_entity_1.ProductVariant, orderLine.productVariant.id);
            const allocation = new allocation_entity_1.Allocation({
                productVariant,
                quantity,
                orderLine,
            });
            allocations.push(allocation);
            if (this.trackInventoryForVariant(productVariant, globalTrackInventory)) {
                productVariant.stockAllocated += quantity;
                await this.connection
                    .getRepository(ctx, product_variant_entity_1.ProductVariant)
                    .save(productVariant, { reload: false });
            }
        }
        const savedAllocations = await this.connection.getRepository(ctx, allocation_entity_1.Allocation).save(allocations);
        if (savedAllocations.length) {
            this.eventBus.publish(new stock_movement_event_1.StockMovementEvent(ctx, savedAllocations));
        }
        return savedAllocations;
    }
    /**
     * @description
     * Creates {@link Sale}s for each OrderLine in the Order. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * reduced and the `stockOnHand` value is also reduced the the OrderLine quantity, indicating
     * that the stock is no longer allocated, but is actually sold and no longer available.
     */
    async createSalesForOrder(ctx, orderItems) {
        const sales = [];
        const globalTrackInventory = (await this.globalSettingsService.getSettings(ctx)).trackInventory;
        const orderItemsWithVariants = await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).findByIds(orderItems.map(i => i.id), {
            relations: ['line', 'line.productVariant'],
        });
        const orderLinesMap = new Map();
        for (const orderItem of orderItemsWithVariants) {
            let value = orderLinesMap.get(orderItem.line.id);
            if (!value) {
                value = { line: orderItem.line, items: [] };
                orderLinesMap.set(orderItem.line.id, value);
            }
            value.items.push(orderItem);
        }
        for (const lineRow of orderLinesMap.values()) {
            const productVariant = await this.connection.getEntityOrThrow(ctx, product_variant_entity_1.ProductVariant, lineRow.line.productVariant.id);
            const sale = new sale_entity_1.Sale({
                productVariant,
                quantity: lineRow.items.length * -1,
                orderLine: lineRow.line,
            });
            sales.push(sale);
            if (this.trackInventoryForVariant(productVariant, globalTrackInventory)) {
                productVariant.stockOnHand -= lineRow.items.length;
                productVariant.stockAllocated -= lineRow.items.length;
                await this.connection
                    .getRepository(ctx, product_variant_entity_1.ProductVariant)
                    .save(productVariant, { reload: false });
            }
        }
        const savedSales = await this.connection.getRepository(ctx, sale_entity_1.Sale).save(sales);
        if (savedSales.length) {
            this.eventBus.publish(new stock_movement_event_1.StockMovementEvent(ctx, savedSales));
        }
        return savedSales;
    }
    /**
     * @description
     * Creates a {@link Cancellation} for each of the specified OrderItems. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockOnHand` value is
     * increased for each Cancellation, allowing that stock to be sold again.
     */
    async createCancellationsForOrderItems(ctx, items) {
        const orderItems = await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).findByIds(items.map(i => i.id), {
            relations: ['line', 'line.productVariant'],
        });
        const cancellations = [];
        const globalTrackInventory = (await this.globalSettingsService.getSettings(ctx)).trackInventory;
        const variantsMap = new Map();
        for (const item of orderItems) {
            let productVariant;
            const productVariantId = item.line.productVariant.id;
            if (variantsMap.has(productVariantId)) {
                // tslint:disable-next-line:no-non-null-assertion
                productVariant = variantsMap.get(productVariantId);
            }
            else {
                productVariant = item.line.productVariant;
                variantsMap.set(productVariantId, productVariant);
            }
            const cancellation = new cancellation_entity_1.Cancellation({
                productVariant,
                quantity: 1,
                orderItem: item,
            });
            cancellations.push(cancellation);
            if (this.trackInventoryForVariant(productVariant, globalTrackInventory)) {
                productVariant.stockOnHand += 1;
                await this.connection
                    .getRepository(ctx, product_variant_entity_1.ProductVariant)
                    .save(productVariant, { reload: false });
            }
        }
        const savedCancellations = await this.connection.getRepository(ctx, cancellation_entity_1.Cancellation).save(cancellations);
        if (savedCancellations.length) {
            this.eventBus.publish(new stock_movement_event_1.StockMovementEvent(ctx, savedCancellations));
        }
        return savedCancellations;
    }
    /**
     * @description
     * Creates a {@link Release} for each of the specified OrderItems. For ProductVariants
     * which are configured to track stock levels, the `ProductVariant.stockAllocated` value is
     * reduced, indicating that this stock is once again available to buy.
     */
    async createReleasesForOrderItems(ctx, items) {
        const orderItems = await this.connection.getRepository(ctx, order_item_entity_1.OrderItem).findByIds(items.map(i => i.id), {
            relations: ['line', 'line.productVariant'],
        });
        const releases = [];
        const globalTrackInventory = (await this.globalSettingsService.getSettings(ctx)).trackInventory;
        const variantsMap = new Map();
        for (const item of orderItems) {
            let productVariant;
            const productVariantId = item.line.productVariant.id;
            if (variantsMap.has(productVariantId)) {
                // tslint:disable-next-line:no-non-null-assertion
                productVariant = variantsMap.get(productVariantId);
            }
            else {
                productVariant = item.line.productVariant;
                variantsMap.set(productVariantId, productVariant);
            }
            const release = new release_entity_1.Release({
                productVariant,
                quantity: 1,
                orderItem: item,
            });
            releases.push(release);
            if (this.trackInventoryForVariant(productVariant, globalTrackInventory)) {
                productVariant.stockAllocated -= 1;
                await this.connection
                    .getRepository(ctx, product_variant_entity_1.ProductVariant)
                    .save(productVariant, { reload: false });
            }
        }
        const savedReleases = await this.connection.getRepository(ctx, release_entity_1.Release).save(releases);
        if (savedReleases.length) {
            this.eventBus.publish(new stock_movement_event_1.StockMovementEvent(ctx, savedReleases));
        }
        return savedReleases;
    }
    trackInventoryForVariant(variant, globalTrackInventory) {
        return (variant.trackInventory === generated_types_1.GlobalFlag.TRUE ||
            (variant.trackInventory === generated_types_1.GlobalFlag.INHERIT && globalTrackInventory));
    }
};
StockMovementService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        list_query_builder_1.ListQueryBuilder,
        global_settings_service_1.GlobalSettingsService,
        event_bus_1.EventBus])
], StockMovementService);
exports.StockMovementService = StockMovementService;
//# sourceMappingURL=stock-movement.service.js.map