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
exports.Collection = void 0;
const typeorm_1 = require("typeorm");
const asset_entity_1 = require("../asset/asset.entity");
const base_entity_1 = require("../base/base.entity");
const channel_entity_1 = require("../channel/channel.entity");
const custom_entity_fields_1 = require("../custom-entity-fields");
const product_variant_entity_1 = require("../product-variant/product-variant.entity");
const collection_asset_entity_1 = require("./collection-asset.entity");
const collection_translation_entity_1 = require("./collection-translation.entity");
/**
 * @description
 * A Collection is a grouping of {@link Product}s based on various configurable criteria.
 *
 * @docsCategory entities
 */
let Collection = 
// TODO: It would be ideal to use the TypeORM built-in tree support, but unfortunately it is incomplete
// at this time - does not support moving or deleting. See https://github.com/typeorm/typeorm/issues/2032
// Therefore we will just use an adjacency list which will have a perf impact when needing to lookup
// decendants or ancestors more than 1 level removed.
// @Tree('closure-table')
class Collection extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
};
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isRoot", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Collection.prototype, "position", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "isPrivate", void 0);
__decorate([
    typeorm_1.OneToMany((type) => collection_translation_entity_1.CollectionTranslation, (translation) => translation.base, { eager: true }),
    __metadata("design:type", Array)
], Collection.prototype, "translations", void 0);
__decorate([
    typeorm_1.ManyToOne((type) => asset_entity_1.Asset, { onDelete: 'SET NULL' }),
    __metadata("design:type", asset_entity_1.Asset)
], Collection.prototype, "featuredAsset", void 0);
__decorate([
    typeorm_1.OneToMany((type) => collection_asset_entity_1.CollectionAsset, (collectionAsset) => collectionAsset.collection),
    __metadata("design:type", Array)
], Collection.prototype, "assets", void 0);
__decorate([
    typeorm_1.Column('simple-json'),
    __metadata("design:type", Array)
], Collection.prototype, "filters", void 0);
__decorate([
    typeorm_1.ManyToMany((type) => product_variant_entity_1.ProductVariant, (productVariant) => productVariant.collections),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Collection.prototype, "productVariants", void 0);
__decorate([
    typeorm_1.Column((type) => custom_entity_fields_1.CustomCollectionFields),
    __metadata("design:type", custom_entity_fields_1.CustomCollectionFields)
], Collection.prototype, "customFields", void 0);
__decorate([
    typeorm_1.TreeChildren(),
    __metadata("design:type", Array)
], Collection.prototype, "children", void 0);
__decorate([
    typeorm_1.TreeParent(),
    __metadata("design:type", Collection)
], Collection.prototype, "parent", void 0);
__decorate([
    typeorm_1.ManyToMany((type) => channel_entity_1.Channel),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Collection.prototype, "channels", void 0);
Collection = __decorate([
    typeorm_1.Entity()
    // TODO: It would be ideal to use the TypeORM built-in tree support, but unfortunately it is incomplete
    // at this time - does not support moving or deleting. See https://github.com/typeorm/typeorm/issues/2032
    // Therefore we will just use an adjacency list which will have a perf impact when needing to lookup
    // decendants or ancestors more than 1 level removed.
    // @Tree('closure-table')
    ,
    __metadata("design:paramtypes", [Object])
], Collection);
exports.Collection = Collection;
//# sourceMappingURL=collection.entity.js.map