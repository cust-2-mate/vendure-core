"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAddressEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever a {@link Customer} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
class CustomerAddressEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, address, type) {
        super();
        this.ctx = ctx;
        this.address = address;
        this.type = type;
    }
}
exports.CustomerAddressEvent = CustomerAddressEvent;
//# sourceMappingURL=customer-address-event.js.map