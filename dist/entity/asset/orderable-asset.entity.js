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
exports.OrderableAsset = void 0;
const typeorm_1 = require("typeorm");
const asset_entity_1 = require("../asset/asset.entity");
const base_entity_1 = require("../base/base.entity");
/**
 * This base class is extended in order to enable specific ordering of the one-to-many
 * Entity -> Assets relation. Using a many-to-many relation does not provide a way
 * to guarantee order of the Assets, so this entity is used in place of the
 * usual join table that would be created by TypeORM.
 * See https://typeorm.io/#/many-to-many-relations/many-to-many-relations-with-custom-properties
 */
class OrderableAsset extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
}
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Object)
], OrderableAsset.prototype, "assetId", void 0);
__decorate([
    typeorm_1.ManyToOne((type) => asset_entity_1.Asset, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", asset_entity_1.Asset)
], OrderableAsset.prototype, "asset", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], OrderableAsset.prototype, "position", void 0);
exports.OrderableAsset = OrderableAsset;
//# sourceMappingURL=orderable-asset.entity.js.map