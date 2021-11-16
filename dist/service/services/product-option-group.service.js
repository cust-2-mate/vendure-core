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
exports.ProductOptionGroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const utils_1 = require("../../common/utils");
const product_option_group_translation_entity_1 = require("../../entity/product-option-group/product-option-group-translation.entity");
const product_option_group_entity_1 = require("../../entity/product-option-group/product-option-group.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const translatable_saver_1 = require("../helpers/translatable-saver/translatable-saver");
const translate_entity_1 = require("../helpers/utils/translate-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
let ProductOptionGroupService = class ProductOptionGroupService {
    constructor(connection, translatableSaver, customFieldRelationService) {
        this.connection = connection;
        this.translatableSaver = translatableSaver;
        this.customFieldRelationService = customFieldRelationService;
    }
    findAll(ctx, filterTerm) {
        const findOptions = {
            relations: ['options'],
        };
        if (filterTerm) {
            findOptions.where = {
                code: typeorm_1.Like(`%${filterTerm}%`),
            };
        }
        return this.connection
            .getRepository(ctx, product_option_group_entity_1.ProductOptionGroup)
            .find(findOptions)
            .then(groups => groups.map(group => translate_entity_1.translateDeep(group, ctx.languageCode, ['options'])));
    }
    findOne(ctx, id) {
        return this.connection
            .getRepository(ctx, product_option_group_entity_1.ProductOptionGroup)
            .findOne(id, {
            relations: ['options'],
        })
            .then(group => group && translate_entity_1.translateDeep(group, ctx.languageCode, ['options']));
    }
    getOptionGroupsByProductId(ctx, id) {
        return this.connection
            .getRepository(ctx, product_option_group_entity_1.ProductOptionGroup)
            .find({
            relations: ['options'],
            where: {
                product: { id },
            },
            order: {
                id: 'ASC',
            },
        })
            .then(groups => groups.map(group => translate_entity_1.translateDeep(group, ctx.languageCode, ['options'])));
    }
    async create(ctx, input) {
        const group = await this.translatableSaver.create({
            ctx,
            input,
            entityType: product_option_group_entity_1.ProductOptionGroup,
            translationType: product_option_group_translation_entity_1.ProductOptionGroupTranslation,
        });
        await this.customFieldRelationService.updateRelations(ctx, product_option_group_entity_1.ProductOptionGroup, input, group);
        return utils_1.assertFound(this.findOne(ctx, group.id));
    }
    async update(ctx, input) {
        const group = await this.translatableSaver.update({
            ctx,
            input,
            entityType: product_option_group_entity_1.ProductOptionGroup,
            translationType: product_option_group_translation_entity_1.ProductOptionGroupTranslation,
        });
        await this.customFieldRelationService.updateRelations(ctx, product_option_group_entity_1.ProductOptionGroup, input, group);
        return utils_1.assertFound(this.findOne(ctx, group.id));
    }
};
ProductOptionGroupService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        translatable_saver_1.TranslatableSaver,
        custom_field_relation_service_1.CustomFieldRelationService])
], ProductOptionGroupService);
exports.ProductOptionGroupService = ProductOptionGroupService;
//# sourceMappingURL=product-option-group.service.js.map