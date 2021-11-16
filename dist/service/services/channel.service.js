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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const unique_1 = require("@vendure/common/lib/unique");
const request_context_1 = require("../../api/common/request-context");
const error_result_1 = require("../../common/error/error-result");
const errors_1 = require("../../common/error/errors");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const channel_entity_1 = require("../../entity/channel/channel.entity");
const product_variant_price_entity_1 = require("../../entity/product-variant/product-variant-price.entity");
const session_entity_1 = require("../../entity/session/session.entity");
const zone_entity_1 = require("../../entity/zone/zone.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const global_settings_service_1 = require("./global-settings.service");
let ChannelService = class ChannelService {
    constructor(connection, configService, globalSettingsService, customFieldRelationService) {
        this.connection = connection;
        this.configService = configService;
        this.globalSettingsService = globalSettingsService;
        this.customFieldRelationService = customFieldRelationService;
        this.allChannels = [];
    }
    /**
     * When the app is bootstrapped, ensure a default Channel exists and populate the
     * channel lookup array.
     */
    async initChannels() {
        await this.ensureDefaultChannelExists();
        await this.updateAllChannels();
    }
    /**
     * Assigns a ChannelAware entity to the default Channel as well as any channel
     * specified in the RequestContext.
     */
    assignToCurrentChannel(entity, ctx) {
        const channelIds = unique_1.unique([ctx.channelId, this.getDefaultChannel().id]);
        entity.channels = channelIds.map(id => ({ id }));
        return entity;
    }
    /**
     * Assigns the entity to the given Channels and saves.
     */
    async assignToChannels(ctx, entityType, entityId, channelIds) {
        const entity = await this.connection.getEntityOrThrow(ctx, entityType, entityId, {
            relations: ['channels'],
        });
        for (const id of channelIds) {
            const channel = await this.connection.getEntityOrThrow(ctx, channel_entity_1.Channel, id);
            entity.channels.push(channel);
        }
        await this.connection.getRepository(ctx, entityType).save(entity, { reload: false });
        return entity;
    }
    /**
     * Removes the entity from the given Channels and saves.
     */
    async removeFromChannels(ctx, entityType, entityId, channelIds) {
        const entity = await this.connection.getRepository(ctx, entityType).findOne(entityId, {
            relations: ['channels'],
        });
        if (!entity) {
            return;
        }
        for (const id of channelIds) {
            entity.channels = entity.channels.filter(c => !utils_1.idsAreEqual(c.id, id));
        }
        await this.connection.getRepository(ctx, entityType).save(entity, { reload: false });
        return entity;
    }
    /**
     * Given a channel token, returns the corresponding Channel if it exists.
     */
    getChannelFromToken(token) {
        if (this.allChannels.length === 1 || token === '') {
            // there is only the default channel, so return it
            return this.getDefaultChannel();
        }
        const channel = this.allChannels.find(c => c.token === token);
        if (!channel) {
            throw new errors_1.ChannelNotFoundError(token);
        }
        return channel;
    }
    /**
     * Returns the default Channel.
     */
    getDefaultChannel() {
        const defaultChannel = this.allChannels.find(channel => channel.code === shared_constants_1.DEFAULT_CHANNEL_CODE);
        if (!defaultChannel) {
            throw new errors_1.InternalServerError(`error.default-channel-not-found`);
        }
        return defaultChannel;
    }
    findAll(ctx) {
        return this.connection
            .getRepository(ctx, channel_entity_1.Channel)
            .find({ relations: ['defaultShippingZone', 'defaultTaxZone'] });
    }
    findOne(ctx, id) {
        return this.connection
            .getRepository(ctx, channel_entity_1.Channel)
            .findOne(id, { relations: ['defaultShippingZone', 'defaultTaxZone'] });
    }
    async create(ctx, input) {
        const channel = new channel_entity_1.Channel(input);
        const defaultLanguageValidationResult = await this.validateDefaultLanguageCode(ctx, input);
        if (error_result_1.isGraphQlErrorResult(defaultLanguageValidationResult)) {
            return defaultLanguageValidationResult;
        }
        if (input.defaultTaxZoneId) {
            channel.defaultTaxZone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, input.defaultTaxZoneId);
        }
        if (input.defaultShippingZoneId) {
            channel.defaultShippingZone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, input.defaultShippingZoneId);
        }
        const newChannel = await this.connection.getRepository(ctx, channel_entity_1.Channel).save(channel);
        await this.customFieldRelationService.updateRelations(ctx, channel_entity_1.Channel, input, newChannel);
        await this.updateAllChannels(ctx);
        return channel;
    }
    async update(ctx, input) {
        const channel = await this.findOne(ctx, input.id);
        if (!channel) {
            throw new errors_1.EntityNotFoundError('Channel', input.id);
        }
        const defaultLanguageValidationResult = await this.validateDefaultLanguageCode(ctx, input);
        if (error_result_1.isGraphQlErrorResult(defaultLanguageValidationResult)) {
            return defaultLanguageValidationResult;
        }
        const updatedChannel = patch_entity_1.patchEntity(channel, input);
        if (input.defaultTaxZoneId) {
            updatedChannel.defaultTaxZone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, input.defaultTaxZoneId);
        }
        if (input.defaultShippingZoneId) {
            updatedChannel.defaultShippingZone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, input.defaultShippingZoneId);
        }
        await this.connection.getRepository(ctx, channel_entity_1.Channel).save(updatedChannel, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, channel_entity_1.Channel, input, updatedChannel);
        await this.updateAllChannels(ctx);
        return utils_1.assertFound(this.findOne(ctx, channel.id));
    }
    async delete(ctx, id) {
        await this.connection.getEntityOrThrow(ctx, channel_entity_1.Channel, id);
        await this.connection.getRepository(ctx, session_entity_1.Session).delete({ activeChannelId: id });
        await this.connection.getRepository(ctx, channel_entity_1.Channel).delete(id);
        await this.connection.getRepository(ctx, product_variant_price_entity_1.ProductVariantPrice).delete({
            channelId: id,
        });
        return {
            result: generated_types_1.DeletionResult.DELETED,
        };
    }
    isChannelAware(entity) {
        const entityType = Object.getPrototypeOf(entity).constructor;
        return !!this.connection.rawConnection
            .getMetadata(entityType)
            .relations.find(r => r.type === channel_entity_1.Channel && r.propertyName === 'channels');
    }
    /**
     * There must always be a default Channel. If none yet exists, this method creates one.
     * Also ensures the default Channel token matches the defaultChannelToken config setting.
     */
    async ensureDefaultChannelExists() {
        const { defaultChannelToken } = this.configService;
        const defaultChannel = await this.connection.getRepository(channel_entity_1.Channel).findOne({
            where: {
                code: shared_constants_1.DEFAULT_CHANNEL_CODE,
            },
        });
        if (!defaultChannel) {
            const newDefaultChannel = new channel_entity_1.Channel({
                code: shared_constants_1.DEFAULT_CHANNEL_CODE,
                defaultLanguageCode: this.configService.defaultLanguageCode,
                pricesIncludeTax: false,
                currencyCode: generated_types_1.CurrencyCode.USD,
                token: defaultChannelToken,
            });
            await this.connection.getRepository(channel_entity_1.Channel).save(newDefaultChannel, { reload: false });
        }
        else if (defaultChannelToken && defaultChannel.token !== defaultChannelToken) {
            defaultChannel.token = defaultChannelToken;
            await this.connection.getRepository(channel_entity_1.Channel).save(defaultChannel, { reload: false });
        }
    }
    async validateDefaultLanguageCode(ctx, input) {
        if (input.defaultLanguageCode) {
            const availableLanguageCodes = await this.globalSettingsService
                .getSettings(ctx)
                .then(s => s.availableLanguages);
            if (!availableLanguageCodes.includes(input.defaultLanguageCode)) {
                return new generated_graphql_admin_errors_1.LanguageNotAvailableError(input.defaultLanguageCode);
            }
        }
    }
    async updateAllChannels(ctx) {
        this.allChannels = await this.findAll(ctx || request_context_1.RequestContext.empty());
    }
};
ChannelService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        global_settings_service_1.GlobalSettingsService,
        custom_field_relation_service_1.CustomFieldRelationService])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map