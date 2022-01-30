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
exports.Cancellation = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const typeorm_1 = require("typeorm");
const order_item_entity_1 = require("../order-item/order-item.entity");
const stock_movement_entity_1 = require("./stock-movement.entity");
/**
 * @description
 * A Cancellation is created when OrderItems from a fulfilled Order are cancelled.
 *
 * @docsCategory entities
 * @docsPage StockMovement
 */
let Cancellation = class Cancellation extends stock_movement_entity_1.StockMovement {
    constructor(input) {
        super(input);
        this.type = generated_types_1.StockMovementType.CANCELLATION;
    }
};
__decorate([
    typeorm_1.ManyToOne(type => order_item_entity_1.OrderItem, orderItem => orderItem.cancellation),
    __metadata("design:type", order_item_entity_1.OrderItem)
], Cancellation.prototype, "orderItem", void 0);
Cancellation = __decorate([
    typeorm_1.ChildEntity(),
    __metadata("design:paramtypes", [Object])
], Cancellation);
exports.Cancellation = Cancellation;
//# sourceMappingURL=cancellation.entity.js.map