"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerGroupChangeEvent = exports.CustomerGroupEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever one or more {@link Customer} is assigned to or removed from a
 * {@link CustomerGroup}.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @deprecated Use {@link CustomerGroupChangeEvent} instead
 */
class CustomerGroupEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, customers, customGroup, type) {
        super();
        this.ctx = ctx;
        this.customers = customers;
        this.customGroup = customGroup;
        this.type = type;
    }
}
exports.CustomerGroupEvent = CustomerGroupEvent;
/**
 * @description
 * This event is fired whenever one or more {@link Customer} is assigned to or removed from a
 * {@link CustomerGroup}.
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
class CustomerGroupChangeEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, customers, customGroup, type) {
        super();
        this.ctx = ctx;
        this.customers = customers;
        this.customGroup = customGroup;
        this.type = type;
    }
}
exports.CustomerGroupChangeEvent = CustomerGroupChangeEvent;
//# sourceMappingURL=customer-group-event.js.map