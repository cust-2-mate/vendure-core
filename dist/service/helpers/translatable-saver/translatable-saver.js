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
exports.TranslatableSaver = void 0;
const common_1 = require("@nestjs/common");
const omit_1 = require("@vendure/common/lib/omit");
const transactional_connection_1 = require("../../transaction/transactional-connection");
const patch_entity_1 = require("../utils/patch-entity");
const translation_differ_1 = require("./translation-differ");
/**
 * A helper which contains methods for creating and updating entities which implement the Translatable interface.
 */
let TranslatableSaver = class TranslatableSaver {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Create a translatable entity, including creating any translation entities according
     * to the `translations` array.
     */
    async create(options) {
        const { ctx, entityType, translationType, input, beforeSave, typeOrmSubscriberData } = options;
        const entity = new entityType(input);
        const translations = [];
        if (input.translations) {
            for (const translationInput of input.translations) {
                const translation = new translationType(translationInput);
                translations.push(translation);
                await this.connection.getRepository(ctx, translationType).save(translation);
            }
        }
        entity.translations = translations;
        if (typeof beforeSave === 'function') {
            await beforeSave(entity);
        }
        return await this.connection
            .getRepository(ctx, entityType)
            .save(entity, { data: typeOrmSubscriberData });
    }
    /**
     * Update a translatable entity. Performs a diff of the `translations` array in order to
     * perform the correct operation on the translations.
     */
    async update(options) {
        const { ctx, entityType, translationType, input, beforeSave, typeOrmSubscriberData } = options;
        const existingTranslations = await this.connection.getRepository(ctx, translationType).find({
            where: { base: input.id },
            relations: ['base'],
        });
        const differ = new translation_differ_1.TranslationDiffer(translationType, this.connection);
        const diff = differ.diff(existingTranslations, input.translations);
        const entity = await differ.applyDiff(ctx, new entityType(Object.assign(Object.assign({}, input), { translations: existingTranslations })), diff);
        const updatedEntity = patch_entity_1.patchEntity(entity, omit_1.omit(input, ['translations']));
        if (typeof beforeSave === 'function') {
            await beforeSave(entity);
        }
        return this.connection
            .getRepository(ctx, entityType)
            .save(updatedEntity, { data: typeOrmSubscriberData });
    }
};
TranslatableSaver = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection])
], TranslatableSaver);
exports.TranslatableSaver = TranslatableSaver;
//# sourceMappingURL=translatable-saver.js.map