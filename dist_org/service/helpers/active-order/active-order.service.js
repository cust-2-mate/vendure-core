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
exports.ActiveOrderService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../../common/error/errors");
const order_service_1 = require("../../services/order.service");
const session_service_1 = require("../../services/session.service");
let ActiveOrderService = class ActiveOrderService {
    constructor(sessionService, orderService) {
        this.sessionService = sessionService;
        this.orderService = orderService;
    }
    async getOrderFromContext(ctx, createIfNotExists = false) {
        if (!ctx.session) {
            throw new errors_1.InternalServerError(`error.no-active-session`);
        }
        let order = ctx.session.activeOrderId
            ? await this.orderService.findOne(ctx, ctx.session.activeOrderId)
            : undefined;
        if (order && order.active === false) {
            // edge case where an inactive order may not have been
            // removed from the session, i.e. the regular process was interrupted
            await this.sessionService.unsetActiveOrder(ctx, ctx.session);
            order = undefined;
        }
        if (!order) {
            if (ctx.activeUserId) {
                order = await this.orderService.getActiveOrderForUser(ctx, ctx.activeUserId);
            }
            if (!order && createIfNotExists) {
                order = await this.orderService.create(ctx, ctx.activeUserId);
            }
            if (order) {
                await this.sessionService.setActiveOrder(ctx, ctx.session, order);
            }
        }
        return order || undefined;
    }
};
ActiveOrderService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [session_service_1.SessionService, order_service_1.OrderService])
], ActiveOrderService);
exports.ActiveOrderService = ActiveOrderService;
//# sourceMappingURL=active-order.service.js.map