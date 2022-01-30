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
exports.RefundEntityResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const refund_entity_1 = require("../../../entity/refund/refund.entity");
const order_service_1 = require("../../../service/services/order.service");
const request_context_1 = require("../../common/request-context");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
let RefundEntityResolver = class RefundEntityResolver {
    constructor(orderService) {
        this.orderService = orderService;
    }
    async orderItems(ctx, refund) {
        if (refund.orderItems) {
            return refund.orderItems;
        }
        else {
            return this.orderService.getRefundOrderItems(ctx, refund.id);
        }
    }
};
__decorate([
    graphql_1.ResolveField(),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, refund_entity_1.Refund]),
    __metadata("design:returntype", Promise)
], RefundEntityResolver.prototype, "orderItems", null);
RefundEntityResolver = __decorate([
    graphql_1.Resolver('Refund'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], RefundEntityResolver);
exports.RefundEntityResolver = RefundEntityResolver;
//# sourceMappingURL=refund-entity.resolver.js.map