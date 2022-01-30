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
exports.EntityHydrator = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const unique_1 = require("@vendure/common/lib/unique");
const errors_1 = require("../../../common/error/errors");
const transactional_connection_1 = require("../../../connection/transactional-connection");
const product_variant_entity_1 = require("../../../entity/product-variant/product-variant.entity");
const product_price_applicator_1 = require("../product-price-applicator/product-price-applicator");
const translate_entity_1 = require("../utils/translate-entity");
/**
 * @description
 * This is a helper class which is used to "hydrate" entity instances, which means to populate them
 * with the specified relations. This is useful when writing plugin code which receives an entity
 * and you need to ensure that one or more relations are present.
 *
 * @example
 * ```TypeScript
 * const product = await this.productVariantService
 *   .getProductForVariant(ctx, variantId);
 *
 * await this.entityHydrator
 *   .hydrate(ctx, product, { relations: ['facetValues.facet' ]});
 *```
 *
 * In this above example, the `product` instance will now have the `facetValues` relation
 * available, and those FacetValues will have their `facet` relations joined too.
 *
 * This `hydrate` method will _also_ automatically take care or translating any
 * translatable entities (e.g. Product, Collection, Facet), and if the `applyProductVariantPrices`
 * options is used (see {@link HydrateOptions}), any related ProductVariant will have the correct
 * Channel-specific prices applied to them.
 *
 * Custom field relations may also be hydrated:
 *
 * @example
 * ```TypeScript
 * const customer = await this.customerService
 *   .findOne(ctx, id);
 *
 * await this.entityHydrator
 *   .hydrate(ctx, customer, { relations: ['customFields.avatar' ]});
 * ```
 *
 * @docsCategory data-access
 * @since 1.3.0
 */
let EntityHydrator = class EntityHydrator {
    constructor(connection, productPriceApplicator) {
        this.connection = connection;
        this.productPriceApplicator = productPriceApplicator;
    }
    /**
     * @description
     * Hydrates (joins) the specified relations to the target entity instance. This method
     * mutates the `target` entity.
     *
     * @example
     * ```TypeScript
     * await this.entityHydrator.hydrate(ctx, product, {
     *   relations: [
     *     'variants.stockMovements'
     *     'optionGroups.options',
     *     'featuredAsset',
     *   ],
     *   applyProductVariantPrices: true,
     * });
     * ```
     *
     * @since 1.3.0
     */
    async hydrate(ctx, target, options) {
        if (options.relations) {
            let missingRelations = this.getMissingRelations(target, options);
            if (options.applyProductVariantPrices === true) {
                const productVariantPriceRelations = this.getRequiredProductVariantRelations(target, missingRelations);
                missingRelations = unique_1.unique([...missingRelations, ...productVariantPriceRelations]);
            }
            if (missingRelations.length) {
                const hydrated = await this.connection
                    .getRepository(ctx, target.constructor)
                    .findOne(target.id, {
                    relations: missingRelations,
                });
                const propertiesToAdd = unique_1.unique(missingRelations.map(relation => relation.split('.')[0]));
                for (const prop of propertiesToAdd) {
                    target[prop] = this.mergeDeep(target[prop], hydrated[prop]);
                }
                const relationsWithEntities = missingRelations.map(relation => ({
                    entity: this.getRelationEntityAtPath(target, relation.split('.')),
                    relation,
                }));
                if (options.applyProductVariantPrices === true) {
                    for (const relationWithEntities of relationsWithEntities) {
                        const entity = relationWithEntities.entity;
                        if (entity) {
                            if (Array.isArray(entity)) {
                                if (entity[0] instanceof product_variant_entity_1.ProductVariant) {
                                    await Promise.all(entity.map((e) => this.productPriceApplicator.applyChannelPriceAndTax(e, ctx)));
                                }
                            }
                            else {
                                if (entity instanceof product_variant_entity_1.ProductVariant) {
                                    await this.productPriceApplicator.applyChannelPriceAndTax(entity, ctx);
                                }
                            }
                        }
                    }
                }
                const translateDeepRelations = relationsWithEntities
                    .filter(item => this.isTranslatable(item.entity))
                    .map(item => item.relation.split('.'));
                this.assignSettableProperties(target, translate_entity_1.translateDeep(target, ctx.languageCode, translateDeepRelations));
            }
        }
        return target;
    }
    assignSettableProperties(target, source) {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(target))) {
            if (typeof descriptor.get === 'function' && typeof descriptor.set !== 'function') {
                // If the entity property has a getter only, we will skip it otherwise
                // we will get an error of the form:
                // `Cannot set property <name> of #<Entity> which has only a getter`
                continue;
            }
            target[key] = source[key];
        }
        return target;
    }
    /**
     * Compares the requested relations against the actual existing relations on the target entity,
     * and returns an array of all missing relation paths that would need to be fetched.
     */
    getMissingRelations(target, options) {
        const missingRelations = [];
        for (const relation of options.relations.slice().sort()) {
            if (typeof relation === 'string') {
                const parts = !relation.startsWith('customFields') ? relation.split('.') : [relation];
                let entity = target;
                const path = [];
                for (const part of parts) {
                    path.push(part);
                    if (entity && entity[part]) {
                        entity = Array.isArray(entity[part]) ? entity[part][0] : entity[part];
                    }
                    else {
                        const allParts = path.reduce((result, p, i) => {
                            if (i === 0) {
                                return [p];
                            }
                            else {
                                return [...result, [result[result.length - 1], p].join('.')];
                            }
                        }, []);
                        missingRelations.push(...allParts);
                        entity = undefined;
                    }
                }
            }
        }
        return unique_1.unique(missingRelations);
    }
    getRequiredProductVariantRelations(target, missingRelations) {
        const relationsToAdd = [];
        for (const relation of missingRelations) {
            const entityType = this.getRelationEntityTypeAtPath(target, relation);
            if (entityType === product_variant_entity_1.ProductVariant) {
                relationsToAdd.push([relation, 'taxCategory'].join('.'));
            }
        }
        return relationsToAdd;
    }
    /**
     * Returns an instance of the related entity at the given path. E.g. a path of `['variants', 'featuredAsset']`
     * will return an Asset instance.
     */
    getRelationEntityAtPath(entity, path) {
        let relation = entity;
        for (let i = 0; i < path.length; i++) {
            const part = path[i];
            const isLast = i === path.length - 1;
            if (relation[part]) {
                relation =
                    Array.isArray(relation[part]) && relation[part].length && !isLast
                        ? relation[part][0]
                        : relation[part];
            }
            else {
                return;
            }
        }
        return relation;
    }
    getRelationEntityTypeAtPath(entity, path) {
        const { entityMetadatas } = this.connection.rawConnection;
        const targetMetadata = entityMetadatas.find(m => m.target === entity.constructor);
        if (!targetMetadata) {
            throw new errors_1.InternalServerError(`Cannot find entity metadata for entity "${entity.constructor.name}"`);
        }
        let currentMetadata = targetMetadata;
        for (const pathPart of path.split('.')) {
            const relationMetadata = currentMetadata.findRelationWithPropertyPath(pathPart);
            if (relationMetadata) {
                currentMetadata = relationMetadata.inverseEntityMetadata;
            }
            else {
                throw new errors_1.InternalServerError(`Cannot find relation metadata for entity "${currentMetadata.targetName}" at path "${pathPart}"`);
            }
        }
        return currentMetadata.target;
    }
    isTranslatable(input) {
        var _a, _b, _c;
        return Array.isArray(input)
            ? (_b = (_a = input[0]) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('translations')) !== null && _b !== void 0 ? _b : false
            : (_c = input === null || input === void 0 ? void 0 : input.hasOwnProperty('translations')) !== null && _c !== void 0 ? _c : false;
    }
    /**
     * Merges properties into a target entity. This is needed for the cases in which a
     * property already exists on the target, but the hydrated version also contains that
     * property with a different set of properties. This prevents the original target
     * entity from having data overwritten.
     */
    mergeDeep(a, b) {
        var _a;
        if (!a) {
            return b;
        }
        for (const [key, value] of Object.entries(b)) {
            if ((_a = Object.getOwnPropertyDescriptor(b, key)) === null || _a === void 0 ? void 0 : _a.writable) {
                if (Array.isArray(value)) {
                    a[key] = value.map((v, index) => { var _a; return this.mergeDeep((_a = a === null || a === void 0 ? void 0 : a[key]) === null || _a === void 0 ? void 0 : _a[index], b[key][index]); });
                }
                else if (shared_utils_1.isObject(value)) {
                    a[key] = this.mergeDeep(a === null || a === void 0 ? void 0 : a[key], b[key]);
                }
                else {
                    a[key] = b[key];
                }
            }
        }
        return a !== null && a !== void 0 ? a : b;
    }
};
EntityHydrator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        product_price_applicator_1.ProductPriceApplicator])
], EntityHydrator);
exports.EntityHydrator = EntityHydrator;
//# sourceMappingURL=entity-hydrator.service.js.map