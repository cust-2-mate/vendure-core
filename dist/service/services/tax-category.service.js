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
exports.TaxCategoryService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const transactional_connection_1 = require("../../connection/transactional-connection");
const tax_category_entity_1 = require("../../entity/tax-category/tax-category.entity");
const tax_rate_entity_1 = require("../../entity/tax-rate/tax-rate.entity");
const event_bus_1 = require("../../event-bus");
const tax_category_event_1 = require("../../event-bus/events/tax-category-event");
const patch_entity_1 = require("../helpers/utils/patch-entity");
/**
 * @description
 * Contains methods relating to {@link TaxCategory} entities.
 *
 * @docsCategory services
 */
let TaxCategoryService = class TaxCategoryService {
    constructor(connection, eventBus) {
        this.connection = connection;
        this.eventBus = eventBus;
    }
    findAll(ctx) {
        return this.connection.getRepository(ctx, tax_category_entity_1.TaxCategory).find();
    }
    findOne(ctx, taxCategoryId) {
        return this.connection.getRepository(ctx, tax_category_entity_1.TaxCategory).findOne(taxCategoryId);
    }
    async create(ctx, input) {
        const taxCategory = new tax_category_entity_1.TaxCategory(input);
        if (input.isDefault === true) {
            await this.connection
                .getRepository(ctx, tax_category_entity_1.TaxCategory)
                .update({ isDefault: true }, { isDefault: false });
        }
        const newTaxCategory = await this.connection.getRepository(ctx, tax_category_entity_1.TaxCategory).save(taxCategory);
        this.eventBus.publish(new tax_category_event_1.TaxCategoryEvent(ctx, newTaxCategory, 'created', input));
        return utils_1.assertFound(this.findOne(ctx, newTaxCategory.id));
    }
    async update(ctx, input) {
        const taxCategory = await this.findOne(ctx, input.id);
        if (!taxCategory) {
            throw new errors_1.EntityNotFoundError('TaxCategory', input.id);
        }
        const updatedTaxCategory = patch_entity_1.patchEntity(taxCategory, input);
        if (input.isDefault === true) {
            await this.connection
                .getRepository(ctx, tax_category_entity_1.TaxCategory)
                .update({ isDefault: true }, { isDefault: false });
        }
        await this.connection.getRepository(ctx, tax_category_entity_1.TaxCategory).save(updatedTaxCategory, { reload: false });
        this.eventBus.publish(new tax_category_event_1.TaxCategoryEvent(ctx, taxCategory, 'updated', input));
        return utils_1.assertFound(this.findOne(ctx, taxCategory.id));
    }
    async delete(ctx, id) {
        const taxCategory = await this.connection.getEntityOrThrow(ctx, tax_category_entity_1.TaxCategory, id);
        const dependentRates = await this.connection
            .getRepository(ctx, tax_rate_entity_1.TaxRate)
            .count({ where: { category: id } });
        if (0 < dependentRates) {
            const message = ctx.translate('message.cannot-remove-tax-category-due-to-tax-rates', {
                name: taxCategory.name,
                count: dependentRates,
            });
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message,
            };
        }
        try {
            await this.connection.getRepository(ctx, tax_category_entity_1.TaxCategory).remove(taxCategory);
            this.eventBus.publish(new tax_category_event_1.TaxCategoryEvent(ctx, taxCategory, 'deleted', id));
            return {
                result: generated_types_1.DeletionResult.DELETED,
            };
        }
        catch (e) {
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
};
TaxCategoryService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection, event_bus_1.EventBus])
], TaxCategoryService);
exports.TaxCategoryService = TaxCategoryService;
//# sourceMappingURL=tax-category.service.js.map