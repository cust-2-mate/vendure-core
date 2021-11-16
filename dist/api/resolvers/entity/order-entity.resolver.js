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
exports.OrderAdminEntityResolver = exports.OrderEntityResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const utils_1 = require("../../../common/utils");
const order_entity_1 = require("../../../entity/order/order.entity");
const history_service_1 = require("../../../service/services/history.service");
const order_service_1 = require("../../../service/services/order.service");
const shipping_method_service_1 = require("../../../service/services/shipping-method.service");
const request_context_1 = require("../../common/request-context");
const api_decorator_1 = require("../../decorators/api.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
let OrderEntityResolver = class OrderEntityResolver {
    constructor(orderService, shippingMethodService, historyService) {
        this.orderService = orderService;
        this.shippingMethodService = shippingMethodService;
        this.historyService = historyService;
    }
    async payments(ctx, order) {
        if (order.payments) {
            return order.payments;
        }
        return this.orderService.getOrderPayments(ctx, order.id);
    }
    async fulfillments(ctx, order) {
        return this.orderService.getOrderFulfillments(ctx, order);
    }
    async surcharges(ctx, order) {
        if (order.surcharges) {
            return order.surcharges;
        }
        return this.orderService.getOrderSurcharges(ctx, order.id);
    }
    async lines(ctx, order) {
        if (order.lines) {
            return order.lines;
        }
        const { lines } = await utils_1.assertFound(this.orderService.findOne(ctx, order.id));
        return lines;
    }
    async history(ctx, apiType, order, args) {
        const publicOnly = apiType === 'shop';
        const options = Object.assign({}, args.options);
        if (!options.sort) {
            options.sort = { createdAt: generated_types_1.SortOrder.ASC };
        }
        return this.historyService.getHistoryForOrder(ctx, order.id, publicOnly, options);
    }
    async promotions(ctx, order) {
        if (order.promotions) {
            return order.promotions;
        }
        return this.orderService.getOrderPromotions(ctx, order.id);
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "payments", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "fulfillments", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "surcharges", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "lines", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, api_decorator_1.Api()),
    __param(2, graphql_1.Parent()),
    __param(3, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, String, order_entity_1.Order, Object]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "history", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderEntityResolver.prototype, "promotions", null);
OrderEntityResolver = __decorate([
    graphql_1.Resolver('Order'),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        shipping_method_service_1.ShippingMethodService,
        history_service_1.HistoryService])
], OrderEntityResolver);
exports.OrderEntityResolver = OrderEntityResolver;
let OrderAdminEntityResolver = class OrderAdminEntityResolver {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async modifications(ctx, order) {
        if (order.modifications) {
            return order.modifications;
        }
        return this.orderService.getOrderModifications(ctx, order.id);
    }
    async nextStates(order) {
        return this.orderService.getNextOrderStates(order);
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderAdminEntityResolver.prototype, "modifications", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_entity_1.Order]),
    __metadata("design:returntype", Promise)
], OrderAdminEntityResolver.prototype, "nextStates", null);
OrderAdminEntityResolver = __decorate([
    graphql_1.Resolver('Order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderAdminEntityResolver);
exports.OrderAdminEntityResolver = OrderAdminEntityResolver;
//# sourceMappingURL=order-entity.resolver.js.map