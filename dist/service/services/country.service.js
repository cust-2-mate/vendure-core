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
exports.CountryService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const transactional_connection_1 = require("../../connection/transactional-connection");
const entity_1 = require("../../entity");
const country_translation_entity_1 = require("../../entity/country/country-translation.entity");
const country_entity_1 = require("../../entity/country/country.entity");
const event_bus_1 = require("../../event-bus");
const country_event_1 = require("../../event-bus/events/country-event");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const translate_entity_1 = require("../helpers/utils/translate-entity");
/**
 * @description
 * Contains methods relating to {@link Country} entities.
 *
 * @docsCategory services
 */
let CountryService = class CountryService {
    constructor(connection, listQueryBuilder, translatableSaver, eventBus) {
        this.connection = connection;
        this.listQueryBuilder = listQueryBuilder;
        this.translatableSaver = translatableSaver;
        this.eventBus = eventBus;
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(country_entity_1.Country, options, { ctx })
            .getManyAndCount()
            .then(([countries, totalItems]) => {
            const items = countries.map(country => translate_entity_1.translateDeep(country, ctx.languageCode));
            return {
                items,
                totalItems,
            };
        });
    }
    findOne(ctx, countryId) {
        return this.connection
            .getRepository(ctx, country_entity_1.Country)
            .findOne(countryId)
            .then(country => country && translate_entity_1.translateDeep(country, ctx.languageCode));
    }
    /**
     * @description
     * Returns an array of enabled Countries, intended for use in a public-facing (ie. Shop) API.
     */
    findAllAvailable(ctx) {
        return this.connection
            .getRepository(ctx, country_entity_1.Country)
            .find({ where: { enabled: true } })
            .then(items => items.map(country => translate_entity_1.translateDeep(country, ctx.languageCode)));
    }
    /**
     * @description
     * Returns a Country based on its ISO country code.
     */
    async findOneByCode(ctx, countryCode) {
        const country = await this.connection.getRepository(ctx, country_entity_1.Country).findOne({
            where: {
                code: countryCode,
            },
        });
        if (!country) {
            throw new errors_1.UserInputError('error.country-code-not-valid', { countryCode });
        }
        return translate_entity_1.translateDeep(country, ctx.languageCode);
    }
    async create(ctx, input) {
        const country = await this.translatableSaver.create({
            ctx,
            input,
            entityType: country_entity_1.Country,
            translationType: country_translation_entity_1.CountryTranslation,
        });
        this.eventBus.publish(new country_event_1.CountryEvent(ctx, country, 'created', input));
        return utils_1.assertFound(this.findOne(ctx, country.id));
    }
    async update(ctx, input) {
        const country = await this.translatableSaver.update({
            ctx,
            input,
            entityType: country_entity_1.Country,
            translationType: country_translation_entity_1.CountryTranslation,
        });
        this.eventBus.publish(new country_event_1.CountryEvent(ctx, country, 'updated', input));
        return utils_1.assertFound(this.findOne(ctx, country.id));
    }
    async delete(ctx, id) {
        const country = await this.connection.getEntityOrThrow(ctx, country_entity_1.Country, id);
        const addressesUsingCountry = await this.connection
            .getRepository(ctx, entity_1.Address)
            .createQueryBuilder('address')
            .where('address.country = :id', { id })
            .getCount();
        if (0 < addressesUsingCountry) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: ctx.translate('message.country-used-in-addresses', { count: addressesUsingCountry }),
            };
        }
        else {
            await this.connection.getRepository(ctx, country_entity_1.Country).remove(country);
            this.eventBus.publish(new country_event_1.CountryEvent(ctx, country, 'deleted', id));
            return {
                result: generated_types_1.DeletionResult.DELETED,
                message: '',
            };
        }
    }
};
CountryService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        list_query_builder_1.ListQueryBuilder,
        translatable_saver_1.TranslatableSaver,
        event_bus_1.EventBus])
], CountryService);
exports.CountryService = CountryService;
//# sourceMappingURL=country.service.js.map