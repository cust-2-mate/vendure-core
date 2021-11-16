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
exports.Country = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base/base.entity");
const country_translation_entity_1 = require("./country-translation.entity");
/**
 * @description
 * A country to which is available when creating / updating an {@link Address}. Countries are
 * grouped together into {@link Zone}s which are in turn used to determine applicable shipping
 * and taxes for an {@link Order}.
 *
 * @docsCategory entities
 */
let Country = class Country extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
};
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Country.prototype, "code", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Country.prototype, "enabled", void 0);
__decorate([
    typeorm_1.OneToMany(type => country_translation_entity_1.CountryTranslation, translation => translation.base, { eager: true }),
    __metadata("design:type", Array)
], Country.prototype, "translations", void 0);
Country = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Country);
exports.Country = Country;
//# sourceMappingURL=country.entity.js.map