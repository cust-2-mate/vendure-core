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
exports.ZoneService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const unique_1 = require("@vendure/common/lib/unique");
const request_context_1 = require("../../api/common/request-context");
const self_refreshing_cache_1 = require("../../common/self-refreshing-cache");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const transactional_connection_1 = require("../../connection/transactional-connection");
const entity_1 = require("../../entity");
const country_entity_1 = require("../../entity/country/country.entity");
const zone_entity_1 = require("../../entity/zone/zone.entity");
const event_bus_1 = require("../../event-bus");
const zone_event_1 = require("../../event-bus/events/zone-event");
const zone_members_event_1 = require("../../event-bus/events/zone-members-event");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const translate_entity_1 = require("../helpers/utils/translate-entity");
/**
 * @description
 * Contains methods relating to {@link Zone} entities.
 *
 * @docsCategory services
 */
let ZoneService = class ZoneService {
    constructor(connection, configService, eventBus) {
        this.connection = connection;
        this.configService = configService;
        this.eventBus = eventBus;
    }
    /** @internal */
    async initZones() {
        this.zones = await self_refreshing_cache_1.createSelfRefreshingCache({
            name: 'ZoneService.zones',
            ttl: this.configService.entityOptions.zoneCacheTtl,
            refresh: {
                fn: ctx => this.connection.getRepository(ctx, zone_entity_1.Zone).find({
                    relations: ['members'],
                }),
                defaultArgs: [request_context_1.RequestContext.empty()],
            },
        });
    }
    async findAll(ctx) {
        return this.zones.memoize([ctx.languageCode], [ctx], (zones, languageCode) => {
            return zones.map((zone, i) => {
                const cloneZone = Object.assign({}, zone);
                cloneZone.members = zone.members.map(country => translate_entity_1.translateDeep(country, languageCode));
                return cloneZone;
            });
        });
    }
    findOne(ctx, zoneId) {
        return this.connection
            .getRepository(ctx, zone_entity_1.Zone)
            .findOne(zoneId, {
            relations: ['members'],
        })
            .then(zone => {
            if (zone) {
                zone.members = zone.members.map(country => translate_entity_1.translateDeep(country, ctx.languageCode));
                return zone;
            }
        });
    }
    async create(ctx, input) {
        const zone = new zone_entity_1.Zone(input);
        if (input.memberIds) {
            zone.members = await this.getCountriesFromIds(ctx, input.memberIds);
        }
        const newZone = await this.connection.getRepository(ctx, zone_entity_1.Zone).save(zone);
        await this.zones.refresh(ctx);
        this.eventBus.publish(new zone_event_1.ZoneEvent(ctx, newZone, 'created', input));
        return utils_1.assertFound(this.findOne(ctx, newZone.id));
    }
    async update(ctx, input) {
        const zone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, input.id);
        const updatedZone = patch_entity_1.patchEntity(zone, input);
        await this.connection.getRepository(ctx, zone_entity_1.Zone).save(updatedZone, { reload: false });
        await this.zones.refresh(ctx);
        this.eventBus.publish(new zone_event_1.ZoneEvent(ctx, zone, 'updated', input));
        return utils_1.assertFound(this.findOne(ctx, zone.id));
    }
    async delete(ctx, id) {
        const zone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, id);
        const channelsUsingZone = await this.connection
            .getRepository(ctx, entity_1.Channel)
            .createQueryBuilder('channel')
            .where('channel.defaultTaxZone = :id', { id })
            .orWhere('channel.defaultShippingZone = :id', { id })
            .getMany();
        if (0 < channelsUsingZone.length) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: ctx.translate('message.zone-used-in-channels', {
                    channelCodes: channelsUsingZone.map(t => t.code).join(', '),
                }),
            };
        }
        const taxRatesUsingZone = await this.connection
            .getRepository(ctx, entity_1.TaxRate)
            .createQueryBuilder('taxRate')
            .where('taxRate.zone = :id', { id })
            .getMany();
        if (0 < taxRatesUsingZone.length) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: ctx.translate('message.zone-used-in-tax-rates', {
                    taxRateNames: taxRatesUsingZone.map(t => t.name).join(', '),
                }),
            };
        }
        else {
            await this.connection.getRepository(ctx, zone_entity_1.Zone).remove(zone);
            await this.zones.refresh(ctx);
            this.eventBus.publish(new zone_event_1.ZoneEvent(ctx, zone, 'deleted', id));
            return {
                result: generated_types_1.DeletionResult.DELETED,
                message: '',
            };
        }
    }
    async addMembersToZone(ctx, { memberIds, zoneId }) {
        const countries = await this.getCountriesFromIds(ctx, memberIds);
        const zone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, zoneId, {
            relations: ['members'],
        });
        const members = unique_1.unique(zone.members.concat(countries), 'id');
        zone.members = members;
        await this.connection.getRepository(ctx, zone_entity_1.Zone).save(zone, { reload: false });
        await this.zones.refresh(ctx);
        this.eventBus.publish(new zone_members_event_1.ZoneMembersEvent(ctx, zone, 'assigned', memberIds));
        return utils_1.assertFound(this.findOne(ctx, zone.id));
    }
    async removeMembersFromZone(ctx, { memberIds, zoneId }) {
        const zone = await this.connection.getEntityOrThrow(ctx, zone_entity_1.Zone, zoneId, {
            relations: ['members'],
        });
        zone.members = zone.members.filter(country => !memberIds.includes(country.id));
        await this.connection.getRepository(ctx, zone_entity_1.Zone).save(zone, { reload: false });
        await this.zones.refresh(ctx);
        this.eventBus.publish(new zone_members_event_1.ZoneMembersEvent(ctx, zone, 'removed', memberIds));
        return utils_1.assertFound(this.findOne(ctx, zone.id));
    }
    getCountriesFromIds(ctx, ids) {
        return this.connection.getRepository(ctx, country_entity_1.Country).findByIds(ids);
    }
};
ZoneService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_service_1.ConfigService,
        event_bus_1.EventBus])
], ZoneService);
exports.ZoneService = ZoneService;
//# sourceMappingURL=zone.service.js.map