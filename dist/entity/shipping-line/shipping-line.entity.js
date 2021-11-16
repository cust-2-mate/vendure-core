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
exports.ShippingLine = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const typeorm_1 = require("typeorm");
const calculated_decorator_1 = require("../../common/calculated-decorator");
const tax_utils_1 = require("../../common/tax-utils");
const base_entity_1 = require("../base/base.entity");
const entity_id_decorator_1 = require("../entity-id.decorator");
const order_entity_1 = require("../order/order.entity");
const shipping_method_entity_1 = require("../shipping-method/shipping-method.entity");
let ShippingLine = class ShippingLine extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
    get price() {
        return this.listPriceIncludesTax ? tax_utils_1.netPriceOf(this.listPrice, this.taxRate) : this.listPrice;
    }
    get priceWithTax() {
        return this.listPriceIncludesTax ? this.listPrice : tax_utils_1.grossPriceOf(this.listPrice, this.taxRate);
    }
    get discountedPrice() {
        const result = this.listPrice + this.getAdjustmentsTotal();
        return this.listPriceIncludesTax ? tax_utils_1.netPriceOf(result, this.taxRate) : result;
    }
    get discountedPriceWithTax() {
        const result = this.listPrice + this.getAdjustmentsTotal();
        return this.listPriceIncludesTax ? result : tax_utils_1.grossPriceOf(result, this.taxRate);
    }
    get taxRate() {
        return shared_utils_1.summate(this.taxLines, 'taxRate');
    }
    get discounts() {
        var _a, _b;
        return ((_b = (_a = this.adjustments) === null || _a === void 0 ? void 0 : _a.map(adjustment => {
            const amount = this.listPriceIncludesTax
                ? tax_utils_1.netPriceOf(adjustment.amount, this.taxRate)
                : adjustment.amount;
            const amountWithTax = this.listPriceIncludesTax
                ? adjustment.amount
                : tax_utils_1.grossPriceOf(adjustment.amount, this.taxRate);
            return Object.assign(Object.assign({}, adjustment), { amount,
                amountWithTax });
        })) !== null && _b !== void 0 ? _b : []);
    }
    addAdjustment(adjustment) {
        this.adjustments = this.adjustments.concat(adjustment);
    }
    /**
     * @description
     * The total of all price adjustments. Will typically be a negative number due to discounts.
     */
    getAdjustmentsTotal() {
        return shared_utils_1.summate(this.adjustments, 'amount');
    }
};
__decorate([
    entity_id_decorator_1.EntityId(),
    __metadata("design:type", Object)
], ShippingLine.prototype, "shippingMethodId", void 0);
__decorate([
    typeorm_1.ManyToOne(type => shipping_method_entity_1.ShippingMethod),
    __metadata("design:type", Object)
], ShippingLine.prototype, "shippingMethod", void 0);
__decorate([
    typeorm_1.ManyToOne(type => order_entity_1.Order, order => order.shippingLines),
    __metadata("design:type", order_entity_1.Order)
], ShippingLine.prototype, "order", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], ShippingLine.prototype, "listPrice", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], ShippingLine.prototype, "listPriceIncludesTax", void 0);
__decorate([
    typeorm_1.Column('simple-json'),
    __metadata("design:type", Array)
], ShippingLine.prototype, "adjustments", void 0);
__decorate([
    typeorm_1.Column('simple-json'),
    __metadata("design:type", Array)
], ShippingLine.prototype, "taxLines", void 0);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "price", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "priceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "discountedPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "discountedPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "taxRate", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [])
], ShippingLine.prototype, "discounts", null);
ShippingLine = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], ShippingLine);
exports.ShippingLine = ShippingLine;
//# sourceMappingURL=shipping-line.entity.js.map