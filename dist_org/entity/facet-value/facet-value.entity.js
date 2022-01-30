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
exports.FacetValue = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base/base.entity");
const channel_entity_1 = require("../channel/channel.entity");
const custom_entity_fields_1 = require("../custom-entity-fields");
const facet_entity_1 = require("../facet/facet.entity");
const facet_value_translation_entity_1 = require("./facet-value-translation.entity");
/**
 * @description
 * A particular value of a {@link Facet}.
 *
 * @docsCategory entities
 */
let FacetValue = class FacetValue extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
};
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], FacetValue.prototype, "code", void 0);
__decorate([
    typeorm_1.OneToMany(type => facet_value_translation_entity_1.FacetValueTranslation, translation => translation.base, { eager: true }),
    __metadata("design:type", Array)
], FacetValue.prototype, "translations", void 0);
__decorate([
    typeorm_1.ManyToOne(type => facet_entity_1.Facet, group => group.values, { onDelete: 'CASCADE' }),
    __metadata("design:type", facet_entity_1.Facet)
], FacetValue.prototype, "facet", void 0);
__decorate([
    typeorm_1.Column(type => custom_entity_fields_1.CustomFacetValueFields),
    __metadata("design:type", custom_entity_fields_1.CustomFacetValueFields)
], FacetValue.prototype, "customFields", void 0);
__decorate([
    typeorm_1.ManyToMany(type => channel_entity_1.Channel),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], FacetValue.prototype, "channels", void 0);
FacetValue = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], FacetValue);
exports.FacetValue = FacetValue;
//# sourceMappingURL=facet-value.entity.js.map