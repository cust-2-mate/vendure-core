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
exports.OrderLine = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const typeorm_1 = require("typeorm");
const calculated_decorator_1 = require("../../common/calculated-decorator");
const tax_utils_1 = require("../../common/tax-utils");
const asset_entity_1 = require("../asset/asset.entity");
const base_entity_1 = require("../base/base.entity");
const custom_entity_fields_1 = require("../custom-entity-fields");
const order_item_entity_1 = require("../order-item/order-item.entity");
const order_entity_1 = require("../order/order.entity");
const product_variant_entity_1 = require("../product-variant/product-variant.entity");
const tax_category_entity_1 = require("../tax-category/tax-category.entity");
/**
 * @description
 * A single line on an {@link Order} which contains one or more {@link OrderItem}s.
 *
 * @docsCategory entities
 */
let OrderLine = class OrderLine extends base_entity_1.VendureEntity {
    constructor(input) {
        super(input);
    }
    get unitPrice() {
        return this.firstActiveItemPropOr('unitPrice', 0);
    }
    get unitPriceWithTax() {
        return this.firstActiveItemPropOr('unitPriceWithTax', 0);
    }
    get unitPriceChangeSinceAdded() {
        const firstItem = this.activeItems[0];
        if (!firstItem) {
            return 0;
        }
        const { initialListPrice, listPriceIncludesTax } = firstItem;
        const initialPrice = listPriceIncludesTax
            ? tax_utils_1.netPriceOf(initialListPrice, this.taxRate)
            : initialListPrice;
        return this.unitPrice - initialPrice;
    }
    get unitPriceWithTaxChangeSinceAdded() {
        const firstItem = this.activeItems[0];
        if (!firstItem) {
            return 0;
        }
        const { initialListPrice, listPriceIncludesTax } = firstItem;
        const initialPriceWithTax = listPriceIncludesTax
            ? initialListPrice
            : tax_utils_1.grossPriceOf(initialListPrice, this.taxRate);
        return this.unitPriceWithTax - initialPriceWithTax;
    }
    get discountedUnitPrice() {
        return this.firstActiveItemPropOr('discountedUnitPrice', 0);
    }
    get discountedUnitPriceWithTax() {
        return this.firstActiveItemPropOr('discountedUnitPriceWithTax', 0);
    }
    get proratedUnitPrice() {
        return this.firstActiveItemPropOr('proratedUnitPrice', 0);
    }
    get proratedUnitPriceWithTax() {
        return this.firstActiveItemPropOr('proratedUnitPriceWithTax', 0);
    }
    get quantity() {
        return this.activeItems.length;
    }
    get adjustments() {
        return this.activeItems.reduce((adjustments, item) => [...adjustments, ...(item.adjustments || [])], []);
    }
    get taxLines() {
        return this.firstActiveItemPropOr('taxLines', []);
    }
    get taxRate() {
        return this.firstActiveItemPropOr('taxRate', 0);
    }
    get linePrice() {
        return shared_utils_1.summate(this.activeItems, 'unitPrice');
    }
    get linePriceWithTax() {
        return shared_utils_1.summate(this.activeItems, 'unitPriceWithTax');
    }
    get discountedLinePrice() {
        return shared_utils_1.summate(this.activeItems, 'discountedUnitPrice');
    }
    get discountedLinePriceWithTax() {
        return shared_utils_1.summate(this.activeItems, 'discountedUnitPriceWithTax');
    }
    get discounts() {
        var _a, _b, _c;
        const priceIncludesTax = (_c = (_b = (_a = this.items) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.listPriceIncludesTax) !== null && _c !== void 0 ? _c : false;
        // Group discounts together, so that it does not list a new
        // discount row for each OrderItem in the line
        const groupedDiscounts = new Map();
        for (const adjustment of this.adjustments) {
            const discountGroup = groupedDiscounts.get(adjustment.adjustmentSource);
            const amount = priceIncludesTax ? tax_utils_1.netPriceOf(adjustment.amount, this.taxRate) : adjustment.amount;
            const amountWithTax = priceIncludesTax
                ? adjustment.amount
                : tax_utils_1.grossPriceOf(adjustment.amount, this.taxRate);
            if (discountGroup) {
                discountGroup.amount += amount;
                discountGroup.amountWithTax += amountWithTax;
            }
            else {
                groupedDiscounts.set(adjustment.adjustmentSource, Object.assign(Object.assign({}, adjustment), { amount,
                    amountWithTax }));
            }
        }
        return [...groupedDiscounts.values()];
    }
    get lineTax() {
        return shared_utils_1.summate(this.activeItems, 'unitTax');
    }
    get proratedLinePrice() {
        return shared_utils_1.summate(this.activeItems, 'proratedUnitPrice');
    }
    get proratedLinePriceWithTax() {
        return shared_utils_1.summate(this.activeItems, 'proratedUnitPriceWithTax');
    }
    get proratedLineTax() {
        return shared_utils_1.summate(this.activeItems, 'proratedUnitTax');
    }
    /**
     * Returns all non-cancelled OrderItems on this line.
     */
    get activeItems() {
        return (this.items || []).filter(i => !i.cancelled);
    }
    /**
     * Returns the first OrderItems of the line (i.e. the one with the earliest
     * `createdAt` property).
     */
    get firstItem() {
        var _a;
        return ((_a = this.items) !== null && _a !== void 0 ? _a : []).sort((a, b) => +a.createdAt - +b.createdAt)[0];
    }
    /**
     * Clears Adjustments from all OrderItems of the given type. If no type
     * is specified, then all adjustments are removed.
     */
    clearAdjustments(type) {
        this.items.forEach(item => item.clearAdjustments(type));
    }
    firstActiveItemPropOr(prop, defaultVal) {
        return this.activeItems.length ? this.activeItems[0][prop] : defaultVal;
    }
};
__decorate([
    typeorm_1.ManyToOne(type => product_variant_entity_1.ProductVariant),
    __metadata("design:type", product_variant_entity_1.ProductVariant)
], OrderLine.prototype, "productVariant", void 0);
__decorate([
    typeorm_1.ManyToOne(type => tax_category_entity_1.TaxCategory),
    __metadata("design:type", tax_category_entity_1.TaxCategory)
], OrderLine.prototype, "taxCategory", void 0);
__decorate([
    typeorm_1.ManyToOne(type => asset_entity_1.Asset),
    __metadata("design:type", asset_entity_1.Asset)
], OrderLine.prototype, "featuredAsset", void 0);
__decorate([
    typeorm_1.OneToMany(type => order_item_entity_1.OrderItem, item => item.line),
    __metadata("design:type", Array)
], OrderLine.prototype, "items", void 0);
__decorate([
    typeorm_1.ManyToOne(type => order_entity_1.Order, order => order.lines, { onDelete: 'CASCADE' }),
    __metadata("design:type", order_entity_1.Order)
], OrderLine.prototype, "order", void 0);
__decorate([
    typeorm_1.Column(type => custom_entity_fields_1.CustomOrderLineFields),
    __metadata("design:type", custom_entity_fields_1.CustomOrderLineFields)
], OrderLine.prototype, "customFields", void 0);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "unitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "unitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "unitPriceChangeSinceAdded", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "unitPriceWithTaxChangeSinceAdded", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "discountedUnitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "discountedUnitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "proratedUnitPrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "proratedUnitPriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "quantity", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "adjustments", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "taxLines", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "taxRate", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "linePrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "linePriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "discountedLinePrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "discountedLinePriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "discounts", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "lineTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "proratedLinePrice", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "proratedLinePriceWithTax", null);
__decorate([
    calculated_decorator_1.Calculated(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], OrderLine.prototype, "proratedLineTax", null);
OrderLine = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [Object])
], OrderLine);
exports.OrderLine = OrderLine;
//# sourceMappingURL=order-line.entity.js.map