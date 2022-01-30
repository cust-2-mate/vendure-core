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
exports.OrderItem = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const typeorm_1 = require("typeorm");
const calculated_decorator_1 = require("../../common/calculated-decorator");
const tax_utils_1 = require("../../common/tax-utils");
const base_entity_1 = require("../base/base.entity");
const entity_id_decorator_1 = require("../entity-id.decorator");
const fulfillment_entity_1 = require("../fulfillment/fulfillment.entity");
const order_line_entity_1 = require("../order-line/order-line.entity");
const refund_entity_1 = require("../refund/refund.entity");
const cancellation_entity_1 = require("../stock-movement/cancellation.entity");
/**
 * @description
 * An individual item of an {@link OrderLine}.
 *
 * @docsCategory entities
 */
let OrderItem = class OrderItem extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
    get fulfillment() {
        var _a;
        return (_a = this.fulfillments) === null || _a === void 0 ? void 0 : _a.find(f => f.state !== 'Cancelled');
    }
    /**
     * @description
     * The price of a single unit, excluding tax and discounts.
     */
    get unitPrice() {
        return this.listPriceIncludesTax ? tax_utils_1.netPriceOf(this.listPrice, this.taxRate) : this.listPrice;
    }
    /**
     * @description
     * The price of a single unit, including tax but excluding discounts.
     */
    get unitPriceWithTax() {
        return this.listPriceIncludesTax ? this.listPrice : tax_utils_1.grossPriceOf(this.listPrice, this.taxRate);
    }
    /**
     * @description
     * The total applicable tax rate, which is the sum of all taxLines on this
     * OrderItem.
     */
    get taxRate() {
        return shared_utils_1.summate(this.taxLines, 'taxRate');
    }
    get unitTax() {
        return this.unitPriceWithTax - this.unitPrice;
    }
    /**
     * @description
     * The price of a single unit including discounts, excluding tax.
     *
     * If Order-level discounts have been applied, this will not be the
     * actual taxable unit price (see `proratedUnitPrice`), but is generally the
     * correct price to display to customers to avoid confusion
     * about the internal handling of distributed Order-level discounts.
     */
    get discountedUnitPrice() {
        const result = this.listPrice + this.getAdjustmentsTotal(generated_types_1.AdjustmentType.PROMOTION);
        return this.listPriceIncludesTax ? tax_utils_1.netPriceOf(result, this.taxRate) : result;
    }
    /**
     * @description
     * The price of a single unit including discounts and tax.
     */
    get discountedUnitPriceWithTax() {
        const result = this.listPrice + this.getAdjustmentsTotal(generated_types_1.AdjustmentType.PROMOTION);
        return this.listPriceIncludesTax ? result : tax_utils_1.grossPriceOf(result, this.taxRate);
    }
    /**
     * @description
     * The actual unit price, taking into account both item discounts _and_ prorated (proportionally-distributed)
     * Order-level discounts. This value is the true economic value of the OrderItem, and is used in tax
     * and refund calculations.
     */
    get proratedUnitPrice() {
        const result = this.listPrice + this.getAdjustmentsTotal();
        return this.listPriceIncludesTax ? tax_utils_1.netPriceOf(result, this.taxRate) : result;
    }
    /**
     * @description
     * The `proratedUnitPrice` including tax.
     */
    get proratedUnitPriceWithTax() {
        const result = this.listPrice + this.getAdjustmentsTotal();
        return this.listPriceIncludesTax ? result : tax_utils_1.grossPriceOf(result, this.taxRate);
    }
    get proratedUnitTax() {
        return this.proratedUnitPriceWithTax - this.proratedUnitPrice;
    }
    /**
     * @description
     * The total of all price adjustments. Will typically be a negative number due to discounts.
     */
    getAdjustmentsTotal(type) {
        if (!this.adjustments) {
            return 0;
        }
        return this.adjustments
            .filter(adjustment => (type ? adjustment.type === type : true))
            .reduce((total, a) => total + a.amount, 0);
    }
    addAdjustment(adjustment) {
        this.adjustments = this.adjustments.concat(adjustment);
    }
    clearAdjustments(type) {
        if (!type) {
            this.adjustments = [];
        }
        else {
            this.adjustments = this.adjustments ? this.adjustments.filter(a => a.type !== type) : [];
        }
    }
};
__decorate([
    typeorm_1.ManyToOne(type => order_line_entity_1.OrderLine, line => line.items, { onDelete: 'CASCADE' }),
    __metadata("design:type", order_line_entity_1.OrderLine)
], OrderItem.prototype, "line", void 0);
__decorate([
    entity_id_decorator_1.EntityId(),
    __metadata("design:type", Object)
], OrderItem.prototype, "lineId", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], OrderItem.prototype, "initialListPrice", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], OrderItem.prototype, "listPrice", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Boolean)
], OrderItem.prototype, "listPriceIncludesTax", void 0);
__decorate([
    typeorm_1.Column('simple-json'),
    __metadata("design:type", Array)
], OrderItem.prototype, "adjustments", void 0);
__decorate([
    typeorm_1.Column('simple-json'),
    __metadata("design:type", Array)
], OrderItem.prototype, "taxLines", void 0);
__decorate([
    typeorm_1.ManyToMany(type => fulfillment_entity_1.Fulfillment, fulfillment => fulfillment.orderItems),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], OrderItem.prototype, "fulfillments", void 0);
__decorate([
    typeorm_1.ManyToOne(type => refund_entity_1.Refund),
    __metadata("design:type", refund_entity_1.Refund)
], OrderItem.prototype, "refund", void 0);
__decorate([
    entity_id_decorator_1.EntityId({ nullable: true }),
    __metadata("design:type", Object)
], OrderItem.prototype, "refundId", void 0);
__decorate([
    typeorm_1.OneToOne(type => cancellation_entity_1.Cancellation, cancellation => cancellation.orderItem),
    __metadata("design:type", cancellation_entity_1.Cancellation)
], OrderItem.prototype, "cancellation", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], OrderItem.prototype, "cancelled", void 0);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "unitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "unitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "taxRate", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "unitTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "discountedUnitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "discountedUnitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "proratedUnitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "proratedUnitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderItem.prototype, "proratedUnitTax", null);
OrderItem = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], OrderItem);
exports.OrderItem = OrderItem;
//# sourceMappingURL=order-item.entity.js.map