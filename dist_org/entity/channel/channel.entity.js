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
exports.Channel = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base/base.entity");
const custom_entity_fields_1 = require("../custom-entity-fields");
const zone_entity_1 = require("../zone/zone.entity");
/**
 * @description
 * A Channel represents a distinct sales channel and configures defaults for that
 * channel.
 *
 * @docsCategory entities
 */
let Channel = class Channel extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
        if (!input || !input.token) {
            this.token = this.generateToken();
        }
    }
    generateToken() {
        const randomString = () => Math.random().toString(36).substr(3, 10);
        return `${randomString()}${randomString()}`;
    }
};
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Channel.prototype, "code", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Channel.prototype, "token", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Channel.prototype, "defaultLanguageCode", void 0);
__decorate([
    typeorm_1.ManyToOne(type => zone_entity_1.Zone),
    __metadata("design:type", zone_entity_1.Zone)
], Channel.prototype, "defaultTaxZone", void 0);
__decorate([
    typeorm_1.ManyToOne(type => zone_entity_1.Zone),
    __metadata("design:type", zone_entity_1.Zone)
], Channel.prototype, "defaultShippingZone", void 0);
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Channel.prototype, "currencyCode", void 0);
__decorate([
    typeorm_1.Column(type => custom_entity_fields_1.CustomChannelFields),
    __metadata("design:type", custom_entity_fields_1.CustomChannelFields)
], Channel.prototype, "customFields", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], Channel.prototype, "pricesIncludeTax", void 0);
Channel = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=channel.entity.js.map