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
exports.GlobalSettingsService = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../common/error/errors");
const config_service_1 = require("../../config/config.service");
const transactional_connection_1 = require("../../connection/transactional-connection");
const global_settings_entity_1 = require("../../entity/global-settings/global-settings.entity");
const event_bus_1 = require("../../event-bus");
const global_settings_event_1 = require("../../event-bus/events/global-settings-event");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const patch_entity_1 = require("../helpers/utils/patch-entity");
/**
 * @description
 * Contains methods relating to the {@link GlobalSettings} entity.
 *
 * @docsCategory services
 */
let GlobalSettingsService = class GlobalSettingsService {
    constructor(connection, configService, customFieldRelationService, eventBus) {
        this.connection = connection;
        this.configService = configService;
        this.customFieldRelationService = customFieldRelationService;
        this.eventBus = eventBus;
    }
    /**
     * Ensure there is a single global settings row in the database.
     * @internal
     */
    async initGlobalSettings() {
        try {
            const result = await this.connection.getRepository(global_settings_entity_1.GlobalSettings).find();
            if (result.length === 0) {
                throw new Error('No global settings');
            }
            if (1 < result.length) {
                // Strange edge case, see https://github.com/vendure-ecommerce/vendure/issues/987
                const toDelete = result.slice(1);
                await this.connection.getRepository(global_settings_entity_1.GlobalSettings).remove(toDelete);
            }
        }
        catch (err) {
            const settings = new global_settings_entity_1.GlobalSettings({
                availableLanguages: [this.configService.defaultLanguageCode],
            });
            await this.connection.getRepository(global_settings_entity_1.GlobalSettings).save(settings, { reload: false });
        }
    }
    /**
     * @description
     * Returns the GlobalSettings entity.
     */
    async getSettings(ctx) {
        const settings = await this.connection.getRepository(ctx, global_settings_entity_1.GlobalSettings).findOne({
            order: {
                createdAt: 'ASC',
            },
        });
        if (!settings) {
            throw new errors_1.InternalServerError(`error.global-settings-not-found`);
        }
        return settings;
    }
    async updateSettings(ctx, input) {
        const settings = await this.getSettings(ctx);
        this.eventBus.publish(new global_settings_event_1.GlobalSettingsEvent(ctx, settings, input));
        patch_entity_1.patchEntity(settings, input);
        await this.customFieldRelationService.updateRelations(ctx, global_settings_entity_1.GlobalSettings, input, settings);
        return this.connection.getRepository(ctx, global_settings_entity_1.GlobalSettings).save(settings);
    }
};
GlobalSettingsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        custom_field_relation_service_1.CustomFieldRelationService,
        event_bus_1.EventBus])
], GlobalSettingsService);
exports.GlobalSettingsService = GlobalSettingsService;
//# sourceMappingURL=global-settings.service.js.map