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
exports.ProductOptionService = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../../common/utils");
const product_option_group_entity_1 = require("../../entity/product-option-group/product-option-group.entity");
const product_option_translation_entity_1 = require("../../entity/product-option/product-option-translation.entity");
const product_option_entity_1 = require("../../entity/product-option/product-option.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
let ProductOptionService = class ProductOptionService {
    constructor(connection, translatableSaver, customFieldRelationService) {
        this.connection = connection;
        this.translatableSaver = translatableSaver;
        this.customFieldRelationService = customFieldRelationService;
    }
    findAll(ctx) {
        return this.connection
            .getRepository(ctx, product_option_entity_1.ProductOption)
            .find({
            relations: ['group'],
        })
            .then(options => options.map(option => translate_entity_1.translateDeep(option, ctx.languageCode)));
    }
    findOne(ctx, id) {
        return this.connection
            .getRepository(ctx, product_option_entity_1.ProductOption)
            .findOne(id, {
            relations: ['group'],
        })
            .then(option => option && translate_entity_1.translateDeep(option, ctx.languageCode));
    }
    async create(ctx, group, input) {
        const productOptionGroup = group instanceof product_option_group_entity_1.ProductOptionGroup
            ? group
            : await this.connection.getEntityOrThrow(ctx, product_option_group_entity_1.ProductOptionGroup, group);
        const option = await this.translatableSaver.create({
            ctx,
            input,
            entityType: product_option_entity_1.ProductOption,
            translationType: product_option_translation_entity_1.ProductOptionTranslation,
            beforeSave: po => (po.group = productOptionGroup),
        });
        await this.customFieldRelationService.updateRelations(ctx, product_option_entity_1.ProductOption, input, option);
        return utils_1.assertFound(this.findOne(ctx, option.id));
    }
    async update(ctx, input) {
        const option = await this.translatableSaver.update({
            ctx,
            input,
            entityType: product_option_entity_1.ProductOption,
            translationType: product_option_translation_entity_1.ProductOptionTranslation,
        });
        await this.customFieldRelationService.updateRelations(ctx, product_option_entity_1.ProductOption, input, option);
        return utils_1.assertFound(this.findOne(ctx, option.id));
    }
};
ProductOptionService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        translatable_saver_1.TranslatableSaver,
        custom_field_relation_service_1.CustomFieldRelationService])
], ProductOptionService);
exports.ProductOptionService = ProductOptionService;
//# sourceMappingURL=product-option.service.js.map