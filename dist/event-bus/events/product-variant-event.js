"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariantEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever a {@link ProductVariant} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
class ProductVariantEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, variants, type) {
        super();
        this.ctx = ctx;
        this.variants = variants;
        this.type = type;
    }
}
exports.ProductVariantEvent = ProductVariantEvent;
//# sourceMappingURL=product-variant-event.js.map