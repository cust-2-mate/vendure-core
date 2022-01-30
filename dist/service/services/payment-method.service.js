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
exports.PaymentMethodService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const omit_1 = require("@vendure/common/lib/omit");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const transactional_connection_1 = require("../../connection/transactional-connection");
const payment_method_entity_1 = require("../../entity/payment-method/payment-method.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const payment_method_event_1 = require("../../event-bus/events/payment-method-event");
const config_arg_service_1 = require("../helpers/config-arg/config-arg.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const channel_service_1 = require("./channel.service");
/**
 * @description
 * Contains methods relating to {@link PaymentMethod} entities.
 *
 * @docsCategory services
 */
let PaymentMethodService = class PaymentMethodService {
    constructor(connection, configService, listQueryBuilder, eventBus, configArgService, channelService) {
        this.connection = connection;
        this.configService = configService;
        this.listQueryBuilder = listQueryBuilder;
        this.eventBus = eventBus;
        this.configArgService = configArgService;
        this.channelService = channelService;
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(payment_method_entity_1.PaymentMethod, options, { ctx, relations: ['channels'], channelId: ctx.channelId })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
            items,
            totalItems,
        }));
    }
    findOne(ctx, paymentMethodId) {
        return this.connection.findOneInChannel(ctx, payment_method_entity_1.PaymentMethod, paymentMethodId, ctx.channelId);
    }
    async create(ctx, input) {
        const paymentMethod = new payment_method_entity_1.PaymentMethod(input);
        paymentMethod.handler = this.configArgService.parseInput('PaymentMethodHandler', input.handler);
        if (input.checker) {
            paymentMethod.checker = this.configArgService.parseInput('PaymentMethodEligibilityChecker', input.checker);
        }
        await this.channelService.assignToCurrentChannel(paymentMethod, ctx);
        const savedPaymentMethod = await this.connection
            .getRepository(ctx, payment_method_entity_1.PaymentMethod)
            .save(paymentMethod);
        this.eventBus.publish(new payment_method_event_1.PaymentMethodEvent(ctx, savedPaymentMethod, 'created', input));
        return savedPaymentMethod;
    }
    async update(ctx, input) {
        const paymentMethod = await this.connection.getEntityOrThrow(ctx, payment_method_entity_1.PaymentMethod, input.id);
        const updatedPaymentMethod = patch_entity_1.patchEntity(paymentMethod, omit_1.omit(input, ['handler', 'checker']));
        if (input.checker) {
            paymentMethod.checker = this.configArgService.parseInput('PaymentMethodEligibilityChecker', input.checker);
        }
        if (input.checker === null) {
            paymentMethod.checker = null;
        }
        if (input.handler) {
            paymentMethod.handler = this.configArgService.parseInput('PaymentMethodHandler', input.handler);
        }
        this.eventBus.publish(new payment_method_event_1.PaymentMethodEvent(ctx, paymentMethod, 'updated', input));
        return this.connection.getRepository(ctx, payment_method_entity_1.PaymentMethod).save(updatedPaymentMethod);
    }
    async delete(ctx, paymentMethodId, force = false) {
        const paymentMethod = await this.connection.getEntityOrThrow(ctx, payment_method_entity_1.PaymentMethod, paymentMethodId, {
            relations: ['channels'],
            channelId: ctx.channelId,
        });
        if (ctx.channel.code === shared_constants_1.DEFAULT_CHANNEL_CODE) {
            const nonDefaultChannels = paymentMethod.channels.filter(channel => channel.code !== shared_constants_1.DEFAULT_CHANNEL_CODE);
            if (0 < nonDefaultChannels.length && !force) {
                const message = ctx.translate('message.payment-method-used-in-channels', {
                    channelCodes: nonDefaultChannels.map(c => c.code).join(', '),
                });
                const result = generated_types_1.DeletionResult.NOT_DELETED;
                return { result, message };
            }
            try {
                await this.connection.getRepository(ctx, payment_method_entity_1.PaymentMethod).remove(paymentMethod);
                this.eventBus.publish(new payment_method_event_1.PaymentMethodEvent(ctx, paymentMethod, 'deleted', paymentMethodId));
                return {
                    result: generated_types_1.DeletionResult.DELETED,
                };
            }
            catch (e) {
                return {
                    result: generated_types_1.DeletionResult.NOT_DELETED,
                    message: e.message || String(e),
                };
            }
        }
        else {
            // If not deleting from the default channel, we will not actually delete,
            // but will remove from the current channel
            paymentMethod.channels = paymentMethod.channels.filter(c => !utils_1.idsAreEqual(c.id, ctx.channelId));
            await this.connection.getRepository(ctx, payment_method_entity_1.PaymentMethod).save(paymentMethod);
            this.eventBus.publish(new payment_method_event_1.PaymentMethodEvent(ctx, paymentMethod, 'deleted', paymentMethodId));
            return {
                result: generated_types_1.DeletionResult.DELETED,
            };
        }
    }
    getPaymentMethodEligibilityCheckers(ctx) {
        return this.configArgService
            .getDefinitions('PaymentMethodEligibilityChecker')
            .map(x => x.toGraphQlType(ctx));
    }
    getPaymentMethodHandlers(ctx) {
        return this.configArgService.getDefinitions('PaymentMethodHandler').map(x => x.toGraphQlType(ctx));
    }
    async getEligiblePaymentMethods(ctx, order) {
        const paymentMethods = await this.connection
            .getRepository(ctx, payment_method_entity_1.PaymentMethod)
            .find({ where: { enabled: true }, relations: ['channels'] });
        const results = [];
        const paymentMethodsInChannel = paymentMethods.filter(p => p.channels.find(pc => utils_1.idsAreEqual(pc.id, ctx.channelId)));
        for (const method of paymentMethodsInChannel) {
            let isEligible = true;
            let eligibilityMessage;
            if (method.checker) {
                const checker = this.configArgService.getByCode('PaymentMethodEligibilityChecker', method.checker.code);
                const eligible = await checker.check(ctx, order, method.checker.args);
                if (eligible === false || typeof eligible === 'string') {
                    isEligible = false;
                    eligibilityMessage = typeof eligible === 'string' ? eligible : undefined;
                }
            }
            results.push({
                id: method.id,
                code: method.code,
                name: method.name,
                description: method.description,
                isEligible,
                eligibilityMessage,
                customFields: method.customFields,
            });
        }
        return results;
    }
    async getMethodAndOperations(ctx, method) {
        const paymentMethod = await this.connection
            .getRepository(ctx, payment_method_entity_1.PaymentMethod)
            .createQueryBuilder('method')
            .leftJoin('method.channels', 'channel')
            .where('method.code = :code', { code: method })
            .andWhere('channel.id = :channelId', { channelId: ctx.channelId })
            .getOne();
        if (!paymentMethod) {
            throw new errors_1.UserInputError(`error.payment-method-not-found`, { method });
        }
        const handler = this.configArgService.getByCode('PaymentMethodHandler', paymentMethod.handler.code);
        const checker = paymentMethod.checker &&
            this.configArgService.getByCode('PaymentMethodEligibilityChecker', paymentMethod.checker.code);
        return { paymentMethod, handler, checker };
    }
};
PaymentMethodService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        list_query_builder_1.ListQueryBuilder,
        event_bus_1.EventBus,
        config_arg_service_1.ConfigArgService,
        channel_service_1.ChannelService])
], PaymentMethodService);
exports.PaymentMethodService = PaymentMethodService;
//# sourceMappingURL=payment-method.service.js.map