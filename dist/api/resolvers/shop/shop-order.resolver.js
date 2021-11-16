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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopOrderResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_shop_types_1 = require("@vendure/common/lib/generated-shop-types");
const error_result_1 = require("../../../common/error/error-result");
const errors_1 = require("../../../common/error/errors");
const generated_graphql_shop_errors_1 = require("../../../common/error/generated-graphql-shop-errors");
const utils_1 = require("../../../common/utils");
const config_1 = require("../../../config");
const service_1 = require("../../../service");
const customer_service_1 = require("../../../service/services/customer.service");
const order_service_1 = require("../../../service/services/order.service");
const session_service_1 = require("../../../service/services/session.service");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let ShopOrderResolver = class ShopOrderResolver {
    constructor(orderService, customerService, sessionService, countryService, activeOrderService, configService) {
        this.orderService = orderService;
        this.customerService = customerService;
        this.sessionService = sessionService;
        this.countryService = countryService;
        this.activeOrderService = activeOrderService;
        this.configService = configService;
    }
    availableCountries(ctx, args) {
        return this.countryService.findAllAvailable(ctx);
    }
    async order(ctx, args) {
        const order = await this.orderService.findOne(ctx, args.id);
        if (order && ctx.authorizedAsOwnerOnly) {
            const orderUserId = order.customer && order.customer.user && order.customer.user.id;
            if (utils_1.idsAreEqual(ctx.activeUserId, orderUserId)) {
                return order;
            }
            else {
                return;
            }
        }
    }
    async activeOrder(ctx) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.findOne(ctx, sessionOrder.id);
            }
            else {
                return;
            }
        }
    }
    async orderByCode(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const order = await this.orderService.findOneByCode(ctx, args.code);
            if (order &&
                (await this.configService.orderOptions.orderByCodeAccessStrategy.canAccessOrder(ctx, order))) {
                return order;
            }
            // We throw even if the order does not exist, since giving a different response
            // opens the door to an enumeration attack to find valid order codes.
            throw new errors_1.ForbiddenError(config_1.LogLevel.Verbose);
        }
    }
    async setOrderShippingAddress(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.setShippingAddress(ctx, sessionOrder.id, args.input);
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
    async setOrderBillingAddress(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.setBillingAddress(ctx, sessionOrder.id, args.input);
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
    async eligibleShippingMethods(ctx) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.getEligibleShippingMethods(ctx, sessionOrder.id);
            }
        }
        return [];
    }
    async eligiblePaymentMethods(ctx) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.getEligiblePaymentMethods(ctx, sessionOrder.id);
            }
        }
        return [];
    }
    async setOrderShippingMethod(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.setShippingMethod(ctx, sessionOrder.id, args.shippingMethodId);
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
    async setOrderCustomFields(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                return this.orderService.updateCustomFields(ctx, sessionOrder.id, args.input.customFields);
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
    async nextOrderStates(ctx) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx, true);
            return this.orderService.getNextOrderStates(sessionOrder);
        }
        return [];
    }
    async transitionOrderToState(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx, true);
            return await this.orderService.transitionToState(ctx, sessionOrder.id, args.state);
        }
    }
    async addItemToOrder(ctx, args) {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.addItemToOrder(ctx, order.id, args.productVariantId, args.quantity, args.customFields);
    }
    async adjustOrderLine(ctx, args) {
        if (args.quantity === 0) {
            return this.removeOrderLine(ctx, { orderLineId: args.orderLineId });
        }
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.adjustOrderLine(ctx, order.id, args.orderLineId, args.quantity, args.customFields);
    }
    async removeOrderLine(ctx, args) {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.removeItemFromOrder(ctx, order.id, args.orderLineId);
    }
    async removeAllOrderLines(ctx) {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.removeAllItemsFromOrder(ctx, order.id);
    }
    async applyCouponCode(ctx, args) {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.applyCouponCode(ctx, order.id, args.couponCode);
    }
    async removeCouponCode(ctx, args) {
        const order = await this.activeOrderService.getOrderFromContext(ctx, true);
        return this.orderService.removeCouponCode(ctx, order.id, args.couponCode);
    }
    async addPaymentToOrder(ctx, args) {
        var _a, _b;
        if (ctx.authorizedAsOwnerOnly) {
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                const order = await this.orderService.addPaymentToOrder(ctx, sessionOrder.id, args.input);
                if (error_result_1.isGraphQlErrorResult(order)) {
                    return order;
                }
                if (order.active === false) {
                    if (order.customer) {
                        const addresses = await this.customerService.findAddressesByCustomerId(ctx, order.customer.id);
                        // If the Customer has no addresses yet, use the shipping address data
                        // to populate the initial default Address.
                        if (addresses.length === 0 && ((_a = order.shippingAddress) === null || _a === void 0 ? void 0 : _a.country)) {
                            const address = order.shippingAddress;
                            await this.customerService.createAddress(ctx, order.customer.id, Object.assign(Object.assign({}, address), { streetLine1: address.streetLine1 || '', streetLine2: address.streetLine2 || '', countryCode: address.countryCode || '', defaultBillingAddress: true, defaultShippingAddress: true }));
                        }
                    }
                }
                if (order.active === false && ((_b = ctx.session) === null || _b === void 0 ? void 0 : _b.activeOrderId) === sessionOrder.id) {
                    await this.sessionService.unsetActiveOrder(ctx, ctx.session);
                }
                return order;
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
    async setCustomerForOrder(ctx, args) {
        if (ctx.authorizedAsOwnerOnly) {
            if (ctx.activeUserId) {
                return new generated_graphql_shop_errors_1.AlreadyLoggedInError();
            }
            const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
            if (sessionOrder) {
                const customer = await this.customerService.createOrUpdate(ctx, args.input, true);
                if (error_result_1.isGraphQlErrorResult(customer)) {
                    return customer;
                }
                return this.orderService.addCustomerToOrder(ctx, sessionOrder.id, customer);
            }
        }
        return new generated_graphql_shop_errors_1.NoActiveOrderError();
    }
};
__decorate([
    graphql_1.Query(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "availableCountries", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "order", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "activeOrder", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "orderByCode", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "setOrderShippingAddress", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "setOrderBillingAddress", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "eligibleShippingMethods", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "eligiblePaymentMethods", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "setOrderShippingMethod", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "setOrderCustomFields", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "nextOrderStates", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "transitionOrderToState", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "addItemToOrder", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "adjustOrderLine", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "removeOrderLine", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "removeAllOrderLines", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "applyCouponCode", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "removeCouponCode", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.UpdateOrder, generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "addPaymentToOrder", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_shop_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopOrderResolver.prototype, "setCustomerForOrder", null);
ShopOrderResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        customer_service_1.CustomerService,
        session_service_1.SessionService,
        service_1.CountryService,
        service_1.ActiveOrderService,
        config_1.ConfigService])
], ShopOrderResolver);
exports.ShopOrderResolver = ShopOrderResolver;
//# sourceMappingURL=shop-order.resolver.js.map