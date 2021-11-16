"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever a {@link Product} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
class ProductEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, product, type) {
        super();
        this.ctx = ctx;
        this.product = product;
        this.type = type;
    }
}
exports.ProductEvent = ProductEvent;
//# sourceMappingURL=product-event.js.map