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
exports.PromotionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const promotion_action_1 = require("../../../config/promotion/promotion-action");
const promotion_condition_1 = require("../../../config/promotion/promotion-condition");
const promotion_entity_1 = require("../../../entity/promotion/promotion.entity");
const promotion_service_1 = require("../../../service/services/promotion.service");
const configurable_operation_codec_1 = require("../../common/configurable-operation-codec");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let PromotionResolver = class PromotionResolver {
    constructor(promotionService, configurableOperationCodec) {
        this.promotionService = promotionService;
        this.configurableOperationCodec = configurableOperationCodec;
        /**
         * Encodes any entity IDs used in the filter arguments.
         */
        this.encodeConditionsAndActions = (maybePromotion) => {
            if (maybePromotion instanceof promotion_entity_1.Promotion) {
                this.configurableOperationCodec.encodeConfigurableOperationIds(promotion_action_1.PromotionOrderAction, maybePromotion.actions);
                this.configurableOperationCodec.encodeConfigurableOperationIds(promotion_condition_1.PromotionCondition, maybePromotion.conditions);
            }
            return maybePromotion;
        };
    }
    promotions(ctx, args) {
        return this.promotionService.findAll(ctx, args.options || undefined).then(res => {
            res.items.forEach(this.encodeConditionsAndActions);
            return res;
        });
    }
    promotion(ctx, args) {
        return this.promotionService.findOne(ctx, args.id).then(this.encodeConditionsAndActions);
    }
    promotionConditions(ctx) {
        return this.promotionService.getPromotionConditions(ctx);
    }
    promotionActions(ctx) {
        return this.promotionService.getPromotionActions(ctx);
    }
    createPromotion(ctx, args) {
        this.configurableOperationCodec.decodeConfigurableOperationIds(promotion_action_1.PromotionOrderAction, args.input.actions);
        this.configurableOperationCodec.decodeConfigurableOperationIds(promotion_condition_1.PromotionCondition, args.input.conditions);
        return this.promotionService.createPromotion(ctx, args.input).then(this.encodeConditionsAndActions);
    }
    updatePromotion(ctx, args) {
        this.configurableOperationCodec.decodeConfigurableOperationIds(promotion_action_1.PromotionOrderAction, args.input.actions || []);
        this.configurableOperationCodec.decodeConfigurableOperationIds(promotion_action_1.PromotionItemAction, args.input.actions || []);
        this.configurableOperationCodec.decodeConfigurableOperationIds(promotion_condition_1.PromotionCondition, args.input.conditions || []);
        return this.promotionService.updatePromotion(ctx, args.input).then(this.encodeConditionsAndActions);
    }
    deletePromotion(ctx, args) {
        return this.promotionService.softDeletePromotion(ctx, args.id);
    }
    assignPromotionsToChannel(ctx, args) {
        return this.promotionService.assignPromotionsToChannel(ctx, args.input);
    }
    removePromotionsFromChannel(ctx, args) {
        return this.promotionService.removePromotionsFromChannel(ctx, args.input);
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadPromotion, generated_types_1.Permission.ReadPromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "promotions", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadPromotion, generated_types_1.Permission.ReadPromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "promotion", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadPromotion, generated_types_1.Permission.ReadPromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", void 0)
], PromotionResolver.prototype, "promotionConditions", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadPromotion, generated_types_1.Permission.ReadPromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", void 0)
], PromotionResolver.prototype, "promotionActions", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.CreatePromotion, generated_types_1.Permission.CreatePromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "createPromotion", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdatePromotion, generated_types_1.Permission.UpdatePromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "updatePromotion", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeletePromotion, generated_types_1.Permission.DeletePromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "deletePromotion", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdatePromotion, generated_types_1.Permission.UpdatePromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "assignPromotionsToChannel", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdatePromotion, generated_types_1.Permission.UpdatePromotion),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], PromotionResolver.prototype, "removePromotionsFromChannel", null);
PromotionResolver = __decorate([
    graphql_1.Resolver('Promotion'),
    __metadata("design:paramtypes", [promotion_service_1.PromotionService,
        configurable_operation_codec_1.ConfigurableOperationCodec])
], PromotionResolver);
exports.PromotionResolver = PromotionResolver;
//# sourceMappingURL=promotion.resolver.js.map