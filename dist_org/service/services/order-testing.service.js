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
exports.OrderTestingService = void 0;
const common_1 = require("@nestjs/common");
const tax_utils_1 = require("../../common/tax-utils");
const config_service_1 = require("../../config/config.service");
const order_item_entity_1 = require("../../entity/order-item/order-item.entity");
const order_line_entity_1 = require("../../entity/order-line/order-line.entity");
const order_entity_1 = require("../../entity/order/order.entity");
const product_variant_entity_1 = require("../../entity/product-variant/product-variant.entity");
const shipping_line_entity_1 = require("../../entity/shipping-line/shipping-line.entity");
const shipping_method_entity_1 = require("../../entity/shipping-method/shipping-method.entity");
const config_arg_service_1 = require("../helpers/config-arg/config-arg.service");
const order_calculator_1 = require("../helpers/order-calculator/order-calculator");
const shipping_calculator_1 = require("../helpers/shipping-calculator/shipping-calculator");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const product_variant_service_1 = require("./product-variant.service");
/**
 * This service is responsible for creating temporary mock Orders against which tests can be run, such as
 * testing a ShippingMethod or Promotion.
 */
let OrderTestingService = class OrderTestingService {
    constructor(connection, orderCalculator, shippingCalculator, configArgService, configService, productVariantService) {
        this.connection = connection;
        this.orderCalculator = orderCalculator;
        this.shippingCalculator = shippingCalculator;
        this.configArgService = configArgService;
        this.configService = configService;
        this.productVariantService = productVariantService;
    }
    /**
     * Runs a given ShippingMethod configuration against a mock Order to test for eligibility and resulting
     * price.
     */
    async testShippingMethod(ctx, input) {
        const shippingMethod = new shipping_method_entity_1.ShippingMethod({
            checker: this.configArgService.parseInput('ShippingEligibilityChecker', input.checker),
            calculator: this.configArgService.parseInput('ShippingCalculator', input.calculator),
        });
        const mockOrder = await this.buildMockOrder(ctx, input.shippingAddress, input.lines);
        const eligible = await shippingMethod.test(ctx, mockOrder);
        const result = eligible ? await shippingMethod.apply(ctx, mockOrder) : undefined;
        let quote;
        if (result) {
            const { price, priceIncludesTax, taxRate, metadata } = result;
            quote = {
                price: priceIncludesTax ? tax_utils_1.netPriceOf(price, taxRate) : price,
                priceWithTax: priceIncludesTax ? price : tax_utils_1.grossPriceOf(price, taxRate),
                metadata,
            };
        }
        return {
            eligible,
            quote,
        };
    }
    /**
     * Tests all available ShippingMethods against a mock Order and return those whic hare eligible. This
     * is intended to simulate a call to the `eligibleShippingMethods` query of the Shop API.
     */
    async testEligibleShippingMethods(ctx, input) {
        const mockOrder = await this.buildMockOrder(ctx, input.shippingAddress, input.lines);
        const eligibleMethods = await this.shippingCalculator.getEligibleShippingMethods(ctx, mockOrder);
        return eligibleMethods
            .map(result => {
            translate_entity_1.translateDeep(result.method, ctx.languageCode);
            return result;
        })
            .map(result => {
            const { price, taxRate, priceIncludesTax, metadata } = result.result;
            return {
                id: result.method.id,
                price: priceIncludesTax ? tax_utils_1.netPriceOf(price, taxRate) : price,
                priceWithTax: priceIncludesTax ? price : tax_utils_1.grossPriceOf(price, taxRate),
                name: result.method.name,
                code: result.method.code,
                description: result.method.description,
                metadata: result.result.metadata,
            };
        });
    }
    async buildMockOrder(ctx, shippingAddress, lines) {
        const { orderItemPriceCalculationStrategy } = this.configService.orderOptions;
        const mockOrder = new order_entity_1.Order({
            lines: [],
            surcharges: [],
            modifications: [],
        });
        mockOrder.shippingAddress = shippingAddress;
        for (const line of lines) {
            const productVariant = await this.connection.getEntityOrThrow(ctx, product_variant_entity_1.ProductVariant, line.productVariantId, { relations: ['taxCategory'] });
            await this.productVariantService.applyChannelPriceAndTax(productVariant, ctx, mockOrder);
            const orderLine = new order_line_entity_1.OrderLine({
                productVariant,
                items: [],
                taxCategory: productVariant.taxCategory,
            });
            mockOrder.lines.push(orderLine);
            const { price, priceIncludesTax } = await orderItemPriceCalculationStrategy.calculateUnitPrice(ctx, productVariant, orderLine.customFields || {});
            const taxRate = productVariant.taxRateApplied;
            const unitPrice = priceIncludesTax ? taxRate.netPriceOf(price) : price;
            for (let i = 0; i < line.quantity; i++) {
                const orderItem = new order_item_entity_1.OrderItem({
                    listPrice: price,
                    listPriceIncludesTax: priceIncludesTax,
                    adjustments: [],
                    taxLines: [],
                });
                orderLine.items.push(orderItem);
            }
        }
        mockOrder.shippingLines = [
            new shipping_line_entity_1.ShippingLine({
                listPrice: 0,
                listPriceIncludesTax: ctx.channel.pricesIncludeTax,
                taxLines: [],
                adjustments: [],
            }),
        ];
        await this.orderCalculator.applyPriceAdjustments(ctx, mockOrder, []);
        return mockOrder;
    }
};
OrderTestingService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        order_calculator_1.OrderCalculator,
        shipping_calculator_1.ShippingCalculator,
        config_arg_service_1.ConfigArgService,
        config_service_1.ConfigService,
        product_variant_service_1.ProductVariantService])
], OrderTestingService);
exports.OrderTestingService = OrderTestingService;
//# sourceMappingURL=order-testing.service.js.map