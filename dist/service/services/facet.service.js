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
exports.FacetService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const facet_translation_entity_1 = require("../../entity/facet/facet-translation.entity");
const facet_entity_1 = require("../../entity/facet/facet.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const channel_service_1 = require("./channel.service");
const facet_value_service_1 = require("./facet-value.service");
let FacetService = class FacetService {
    constructor(connection, facetValueService, translatableSaver, listQueryBuilder, configService, channelService, customFieldRelationService) {
        this.connection = connection;
        this.facetValueService = facetValueService;
        this.translatableSaver = translatableSaver;
        this.listQueryBuilder = listQueryBuilder;
        this.configService = configService;
        this.channelService = channelService;
        this.customFieldRelationService = customFieldRelationService;
    }
    findAll(ctx, options) {
        const relations = ['values', 'values.facet', 'channels'];
        return this.listQueryBuilder
            .build(facet_entity_1.Facet, options, { relations, ctx, channelId: ctx.channelId })
            .getManyAndCount()
            .then(([facets, totalItems]) => {
            const items = facets.map(facet => translate_entity_1.translateDeep(facet, ctx.languageCode, ['values', ['values', 'facet']]));
            return {
                items,
                totalItems,
            };
        });
    }
    findOne(ctx, facetId) {
        const relations = ['values', 'values.facet', 'channels'];
        return this.connection
            .findOneInChannel(ctx, facet_entity_1.Facet, facetId, ctx.channelId, { relations })
            .then(facet => facet && translate_entity_1.translateDeep(facet, ctx.languageCode, ['values', ['values', 'facet']]));
    }
    findByCode(facetCode, lang) {
        const relations = ['values', 'values.facet'];
        return this.connection
            .getRepository(facet_entity_1.Facet)
            .findOne({
            where: {
                code: facetCode,
            },
            relations,
        })
            .then(facet => facet && translate_entity_1.translateDeep(facet, lang, ['values', ['values', 'facet']]));
    }
    async findByFacetValueId(ctx, id) {
        const facet = await this.connection
            .getRepository(ctx, facet_entity_1.Facet)
            .createQueryBuilder('facet')
            .leftJoinAndSelect('facet.translations', 'translations')
            .leftJoin('facet.values', 'facetValue')
            .where('facetValue.id = :id', { id })
            .getOne();
        if (facet) {
            return translate_entity_1.translateDeep(facet, ctx.languageCode);
        }
    }
    async create(ctx, input) {
        const facet = await this.translatableSaver.create({
            ctx,
            input,
            entityType: facet_entity_1.Facet,
            translationType: facet_translation_entity_1.FacetTranslation,
            beforeSave: async (f) => {
                f.code = await this.ensureUniqueCode(ctx, f.code);
                this.channelService.assignToCurrentChannel(f, ctx);
            },
        });
        await this.customFieldRelationService.updateRelations(ctx, facet_entity_1.Facet, input, facet);
        return utils_1.assertFound(this.findOne(ctx, facet.id));
    }
    async update(ctx, input) {
        const facet = await this.translatableSaver.update({
            ctx,
            input,
            entityType: facet_entity_1.Facet,
            translationType: facet_translation_entity_1.FacetTranslation,
            beforeSave: async (f) => {
                f.code = await this.ensureUniqueCode(ctx, f.code, f.id);
            },
        });
        await this.customFieldRelationService.updateRelations(ctx, facet_entity_1.Facet, input, facet);
        return utils_1.assertFound(this.findOne(ctx, facet.id));
    }
    async delete(ctx, id, force = false) {
        const facet = await this.connection.getEntityOrThrow(ctx, facet_entity_1.Facet, id, {
            relations: ['values'],
            channelId: ctx.channelId,
        });
        let productCount = 0;
        let variantCount = 0;
        if (facet.values.length) {
            const counts = await this.facetValueService.checkFacetValueUsage(ctx, facet.values.map(fv => fv.id));
            productCount = counts.productCount;
            variantCount = counts.variantCount;
        }
        const isInUse = !!(productCount || variantCount);
        const both = !!(productCount && variantCount) ? 'both' : 'single';
        const i18nVars = { products: productCount, variants: variantCount, both };
        let message = '';
        let result;
        if (!isInUse) {
            await this.connection.getRepository(ctx, facet_entity_1.Facet).remove(facet);
            result = generated_types_1.DeletionResult.DELETED;
        }
        else if (force) {
            await this.connection.getRepository(ctx, facet_entity_1.Facet).remove(facet);
            message = ctx.translate('message.facet-force-deleted', i18nVars);
            result = generated_types_1.DeletionResult.DELETED;
        }
        else {
            message = ctx.translate('message.facet-used', i18nVars);
            result = generated_types_1.DeletionResult.NOT_DELETED;
        }
        return {
            result,
            message,
        };
    }
    /**
     * Checks to ensure the Facet code is unique. If there is a conflict, then the code is suffixed
     * with an incrementing integer.
     */
    async ensureUniqueCode(ctx, code, id) {
        let candidate = code;
        let suffix = 1;
        let conflict = false;
        const alreadySuffixed = /-\d+$/;
        do {
            const match = await this.connection
                .getRepository(ctx, facet_entity_1.Facet)
                .findOne({ where: { code: candidate } });
            conflict = !!match && ((id != null && !utils_1.idsAreEqual(match.id, id)) || id == null);
            if (conflict) {
                suffix++;
                if (alreadySuffixed.test(candidate)) {
                    candidate = candidate.replace(alreadySuffixed, `-${suffix}`);
                }
                else {
                    candidate = `${candidate}-${suffix}`;
                }
            }
        } while (conflict);
        return candidate;
    }
};
FacetService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        facet_value_service_1.FacetValueService,
        translatable_saver_1.TranslatableSaver,
        list_query_builder_1.ListQueryBuilder,
        config_service_1.ConfigService,
        channel_service_1.ChannelService,
        custom_field_relation_service_1.CustomFieldRelationService])
], FacetService);
exports.FacetService = FacetService;
//# sourceMappingURL=facet.service.js.map