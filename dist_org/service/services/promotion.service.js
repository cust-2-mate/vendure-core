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
exports.PromotionService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const omit_1 = require("@vendure/common/lib/omit");
const unique_1 = require("@vendure/common/lib/unique");
const errors_1 = require("../../common/error/errors");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const generated_graphql_shop_errors_1 = require("../../common/error/generated-graphql-shop-errors");
const adjustment_source_1 = require("../../common/types/adjustment-source");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const order_entity_1 = require("../../entity/order/order.entity");
const promotion_entity_1 = require("../../entity/promotion/promotion.entity");
const config_arg_service_1 = require("../helpers/config-arg/config-arg.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const channel_service_1 = require("./channel.service");
let PromotionService = class PromotionService {
    constructor(connection, configService, channelService, listQueryBuilder, configArgService) {
        this.connection = connection;
        this.configService = configService;
        this.channelService = channelService;
        this.listQueryBuilder = listQueryBuilder;
        this.configArgService = configArgService;
        this.availableConditions = [];
        this.availableActions = [];
        /**
         * All active AdjustmentSources are cached in memory becuase they are needed
         * every time an order is changed, which will happen often. Caching them means
         * a DB call is not required newly each time.
         */
        this.activePromotions = [];
        this.availableConditions = this.configService.promotionOptions.promotionConditions || [];
        this.availableActions = this.configService.promotionOptions.promotionActions || [];
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(promotion_entity_1.Promotion, options, {
            where: { deletedAt: null },
            channelId: ctx.channelId,
            relations: ['channels'],
            ctx,
        })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
            items,
            totalItems,
        }));
    }
    async findOne(ctx, adjustmentSourceId) {
        return this.connection.findOneInChannel(ctx, promotion_entity_1.Promotion, adjustmentSourceId, ctx.channelId, {
            where: { deletedAt: null },
        });
    }
    getPromotionConditions(ctx) {
        return this.availableConditions.map(x => x.toGraphQlType(ctx));
    }
    getPromotionActions(ctx) {
        return this.availableActions.map(x => x.toGraphQlType(ctx));
    }
    /**
     * Returns all active AdjustmentSources.
     */
    async getActivePromotions() {
        if (!this.activePromotions.length) {
            await this.updatePromotions();
        }
        return this.activePromotions;
    }
    async createPromotion(ctx, input) {
        const conditions = input.conditions.map(c => this.configArgService.parseInput('PromotionCondition', c));
        const actions = input.actions.map(a => this.configArgService.parseInput('PromotionAction', a));
        this.validateRequiredConditions(conditions, actions);
        const promotion = new promotion_entity_1.Promotion({
            name: input.name,
            enabled: input.enabled,
            couponCode: input.couponCode,
            perCustomerUsageLimit: input.perCustomerUsageLimit,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            conditions,
            actions,
            priorityScore: this.calculatePriorityScore(input),
        });
        if (promotion.conditions.length === 0 && !promotion.couponCode) {
            return new generated_graphql_admin_errors_1.MissingConditionsError();
        }
        this.channelService.assignToCurrentChannel(promotion, ctx);
        const newPromotion = await this.connection.getRepository(ctx, promotion_entity_1.Promotion).save(promotion);
        await this.updatePromotions();
        return utils_1.assertFound(this.findOne(ctx, newPromotion.id));
    }
    async updatePromotion(ctx, input) {
        const promotion = await this.connection.getEntityOrThrow(ctx, promotion_entity_1.Promotion, input.id, {
            channelId: ctx.channelId,
        });
        const updatedPromotion = patch_entity_1.patchEntity(promotion, omit_1.omit(input, ['conditions', 'actions']));
        if (input.conditions) {
            updatedPromotion.conditions = input.conditions.map(c => this.configArgService.parseInput('PromotionCondition', c));
        }
        if (input.actions) {
            updatedPromotion.actions = input.actions.map(a => this.configArgService.parseInput('PromotionAction', a));
        }
        if (promotion.conditions.length === 0 && !promotion.couponCode) {
            return new generated_graphql_admin_errors_1.MissingConditionsError();
        }
        promotion.priorityScore = this.calculatePriorityScore(input);
        await this.connection.getRepository(ctx, promotion_entity_1.Promotion).save(updatedPromotion, { reload: false });
        await this.updatePromotions();
        return utils_1.assertFound(this.findOne(ctx, updatedPromotion.id));
    }
    async softDeletePromotion(ctx, promotionId) {
        await this.connection.getEntityOrThrow(ctx, promotion_entity_1.Promotion, promotionId);
        await this.connection
            .getRepository(ctx, promotion_entity_1.Promotion)
            .update({ id: promotionId }, { deletedAt: new Date() });
        return {
            result: generated_types_1.DeletionResult.DELETED,
        };
    }
    async assignPromotionsToChannel(ctx, input) {
        if (!utils_1.idsAreEqual(ctx.channelId, this.channelService.getDefaultChannel().id)) {
            throw new errors_1.IllegalOperationError(`promotion-channels-can-only-be-changed-from-default-channel`);
        }
        const promotions = await this.connection.findByIdsInChannel(ctx, promotion_entity_1.Promotion, input.promotionIds, ctx.channelId, {});
        for (const promotion of promotions) {
            await this.channelService.assignToChannels(ctx, promotion_entity_1.Promotion, promotion.id, [input.channelId]);
        }
        return promotions;
    }
    async removePromotionsFromChannel(ctx, input) {
        if (!utils_1.idsAreEqual(ctx.channelId, this.channelService.getDefaultChannel().id)) {
            throw new errors_1.IllegalOperationError(`promotion-channels-can-only-be-changed-from-default-channel`);
        }
        const promotions = await this.connection.findByIdsInChannel(ctx, promotion_entity_1.Promotion, input.promotionIds, ctx.channelId, {});
        for (const promotion of promotions) {
            await this.channelService.removeFromChannels(ctx, promotion_entity_1.Promotion, promotion.id, [input.channelId]);
        }
        return promotions;
    }
    async validateCouponCode(ctx, couponCode, customerId) {
        const promotion = await this.connection.getRepository(ctx, promotion_entity_1.Promotion).findOne({
            where: {
                couponCode,
                enabled: true,
                deletedAt: null,
            },
        });
        if (!promotion) {
            return new generated_graphql_shop_errors_1.CouponCodeInvalidError(couponCode);
        }
        if (promotion.endsAt && +promotion.endsAt < +new Date()) {
            return new generated_graphql_shop_errors_1.CouponCodeExpiredError(couponCode);
        }
        if (customerId && promotion.perCustomerUsageLimit != null) {
            const usageCount = await this.countPromotionUsagesForCustomer(ctx, promotion.id, customerId);
            if (promotion.perCustomerUsageLimit <= usageCount) {
                return new generated_graphql_shop_errors_1.CouponCodeLimitError(couponCode, promotion.perCustomerUsageLimit);
            }
        }
        return promotion;
    }
    async addPromotionsToOrder(ctx, order) {
        const allPromotionIds = order.discounts.map(a => adjustment_source_1.AdjustmentSource.decodeSourceId(a.adjustmentSource).id);
        const promotionIds = unique_1.unique(allPromotionIds);
        const promotions = await this.connection.getRepository(ctx, promotion_entity_1.Promotion).findByIds(promotionIds);
        order.promotions = promotions;
        return this.connection.getRepository(ctx, order_entity_1.Order).save(order);
    }
    async countPromotionUsagesForCustomer(ctx, promotionId, customerId) {
        const qb = this.connection
            .getRepository(ctx, order_entity_1.Order)
            .createQueryBuilder('order')
            .leftJoin('order.promotions', 'promotion')
            .where('promotion.id = :promotionId', { promotionId })
            .andWhere('order.customer = :customerId', { customerId });
        return qb.getCount();
    }
    calculatePriorityScore(input) {
        const conditions = input.conditions
            ? input.conditions.map(c => this.configArgService.getByCode('PromotionCondition', c.code))
            : [];
        const actions = input.actions
            ? input.actions.map(c => this.configArgService.getByCode('PromotionAction', c.code))
            : [];
        return [...conditions, ...actions].reduce((score, op) => score + op.priorityValue, 0);
    }
    /**
     * Update the activeSources cache.
     */
    async updatePromotions() {
        this.activePromotions = await this.connection.getRepository(promotion_entity_1.Promotion).find({
            where: { enabled: true },
        });
    }
    validateRequiredConditions(conditions, actions) {
        const conditionCodes = conditions.reduce((codeMap, { code }) => (Object.assign(Object.assign({}, codeMap), { [code]: code })), {});
        for (const { code: actionCode } of actions) {
            const actionDef = this.configArgService.getByCode('PromotionAction', actionCode);
            const actionDependencies = actionDef.conditions || [];
            if (!actionDependencies || actionDependencies.length === 0) {
                continue;
            }
            const missingConditions = actionDependencies.filter(condition => !conditionCodes[condition.code]);
            if (missingConditions.length) {
                throw new errors_1.UserInputError('error.conditions-required-for-action', {
                    action: actionCode,
                    conditions: missingConditions.map(c => c.code).join(', '),
                });
            }
        }
    }
};
PromotionService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        channel_service_1.ChannelService,
        list_query_builder_1.ListQueryBuilder,
        config_arg_service_1.ConfigArgService])
], PromotionService);
exports.PromotionService = PromotionService;
//# sourceMappingURL=promotion.service.js.map