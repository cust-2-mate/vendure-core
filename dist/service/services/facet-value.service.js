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
exports.FacetValueService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const entity_1 = require("../../entity");
const facet_value_translation_entity_1 = require("../../entity/facet-value/facet-value-translation.entity");
const facet_value_entity_1 = require("../../entity/facet-value/facet-value.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const channel_service_1 = require("./channel.service");
let FacetValueService = class FacetValueService {
    constructor(connection, translatableSaver, configService, customFieldRelationService, channelService) {
        this.connection = connection;
        this.translatableSaver = translatableSaver;
        this.configService = configService;
        this.customFieldRelationService = customFieldRelationService;
        this.channelService = channelService;
    }
    findAll(lang) {
        return this.connection
            .getRepository(facet_value_entity_1.FacetValue)
            .find({
            relations: ['facet'],
        })
            .then(facetValues => facetValues.map(facetValue => translate_entity_1.translateDeep(facetValue, lang, ['facet'])));
    }
    findOne(ctx, id) {
        return this.connection
            .getRepository(ctx, facet_value_entity_1.FacetValue)
            .findOne(id, {
            relations: ['facet'],
        })
            .then(facetValue => facetValue && translate_entity_1.translateDeep(facetValue, ctx.languageCode, ['facet']));
    }
    findByIds(ctx, ids) {
        const facetValues = this.connection.findByIdsInChannel(ctx, facet_value_entity_1.FacetValue, ids, ctx.channelId, {
            relations: ['facet'],
        });
        return facetValues.then(values => values.map(facetValue => translate_entity_1.translateDeep(facetValue, ctx.languageCode, ['facet'])));
    }
    findByFacetId(ctx, id) {
        return this.connection
            .getRepository(ctx, facet_value_entity_1.FacetValue)
            .find({
            where: {
                facet: { id },
            },
        })
            .then(values => values.map(facetValue => translate_entity_1.translateDeep(facetValue, ctx.languageCode)));
    }
    async create(ctx, facet, input) {
        const facetValue = await this.translatableSaver.create({
            ctx,
            input,
            entityType: facet_value_entity_1.FacetValue,
            translationType: facet_value_translation_entity_1.FacetValueTranslation,
            beforeSave: fv => {
                fv.facet = facet;
                this.channelService.assignToCurrentChannel(fv, ctx);
            },
        });
        await this.customFieldRelationService.updateRelations(ctx, facet_value_entity_1.FacetValue, input, facetValue);
        return utils_1.assertFound(this.findOne(ctx, facetValue.id));
    }
    async update(ctx, input) {
        const facetValue = await this.translatableSaver.update({
            ctx,
            input,
            entityType: facet_value_entity_1.FacetValue,
            translationType: facet_value_translation_entity_1.FacetValueTranslation,
        });
        await this.customFieldRelationService.updateRelations(ctx, facet_value_entity_1.FacetValue, input, facetValue);
        return utils_1.assertFound(this.findOne(ctx, facetValue.id));
    }
    async delete(ctx, id, force = false) {
        const { productCount, variantCount } = await this.checkFacetValueUsage(ctx, [id]);
        const isInUse = !!(productCount || variantCount);
        const both = !!(productCount && variantCount) ? 'both' : 'single';
        const i18nVars = { products: productCount, variants: variantCount, both };
        let message = '';
        let result;
        if (!isInUse) {
            const facetValue = await this.connection.getEntityOrThrow(ctx, facet_value_entity_1.FacetValue, id);
            await this.connection.getRepository(ctx, facet_value_entity_1.FacetValue).remove(facetValue);
            result = generated_types_1.DeletionResult.DELETED;
        }
        else if (force) {
            const facetValue = await this.connection.getEntityOrThrow(ctx, facet_value_entity_1.FacetValue, id);
            await this.connection.getRepository(ctx, facet_value_entity_1.FacetValue).remove(facetValue);
            message = ctx.translate('message.facet-value-force-deleted', i18nVars);
            result = generated_types_1.DeletionResult.DELETED;
        }
        else {
            message = ctx.translate('message.facet-value-used', i18nVars);
            result = generated_types_1.DeletionResult.NOT_DELETED;
        }
        return {
            result,
            message,
        };
    }
    /**
     * Checks for usage of the given FacetValues in any Products or Variants, and returns the counts.
     */
    async checkFacetValueUsage(ctx, facetValueIds) {
        const consumingProducts = await this.connection
            .getRepository(ctx, entity_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.facetValues', 'facetValues')
            .where('facetValues.id IN (:...facetValueIds)', { facetValueIds })
            .getMany();
        const consumingVariants = await this.connection
            .getRepository(ctx, entity_1.ProductVariant)
            .createQueryBuilder('variant')
            .leftJoinAndSelect('variant.facetValues', 'facetValues')
            .where('facetValues.id IN (:...facetValueIds)', { facetValueIds })
            .getMany();
        return {
            productCount: consumingProducts.length,
            variantCount: consumingVariants.length,
        };
    }
};
FacetValueService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        translatable_saver_1.TranslatableSaver,
        config_service_1.ConfigService,
        custom_field_relation_service_1.CustomFieldRelationService,
        channel_service_1.ChannelService])
], FacetValueService);
exports.FacetValueService = FacetValueService;
//# sourceMappingURL=facet-value.service.js.map