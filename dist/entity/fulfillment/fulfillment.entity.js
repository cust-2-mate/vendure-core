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
exports.Fulfillment = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base/base.entity");
const custom_entity_fields_1 = require("../custom-entity-fields");
const order_item_entity_1 = require("../order-item/order-item.entity");
/**
 * @description
 * This entity represents a fulfillment of an Order or part of it, i.e. the {@link OrderItem}s have been
 * delivered to the Customer after successful payment.
 *
 * @docsCategory entities
 */
let Fulfillment = class Fulfillment extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
};
__decorate([
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], Fulfillment.prototype, "state", void 0);
__decorate([
    typeorm_1.Column({ default: '' }),
    __metadata("design:type", String)
], Fulfillment.prototype, "trackingCode", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Fulfillment.prototype, "method", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Fulfillment.prototype, "handlerCode", void 0);
__decorate([
    typeorm_1.ManyToMany(type => order_item_entity_1.OrderItem, orderItem => orderItem.fulfillments),
    __metadata("design:type", Array)
], Fulfillment.prototype, "orderItems", void 0);
__decorate([
    typeorm_1.Column(type => custom_entity_fields_1.CustomFulfillmentFields),
    __metadata("design:type", custom_entity_fields_1.CustomFulfillmentFields)
], Fulfillment.prototype, "customFields", void 0);
Fulfillment = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], Fulfillment);
exports.Fulfillment = Fulfillment;
//# sourceMappingURL=fulfillment.entity.js.map