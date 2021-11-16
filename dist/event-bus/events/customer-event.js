"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever a {@link Customer} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
class CustomerEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, customer, type) {
        super();
        this.ctx = ctx;
        this.customer = customer;
        this.type = type;
    }
}
exports.CustomerEvent = CustomerEvent;
//# sourceMappingURL=customer-event.js.map