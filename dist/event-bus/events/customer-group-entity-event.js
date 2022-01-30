"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerGroupEntityEvent = void 0;
const vendure_entity_event_1 = require("../vendure-entity-event");
/**
 * @description
 * This event is fired whenever a {@link CustomerGroup} is added, updated or deleted.
 * Use this event instead of {@link CustomerGroupEvent} until the next major version!
 *
 * @docsCategory events
 * @docsPage Event Types
 * @since 1.4
 */
class CustomerGroupEntityEvent extends vendure_entity_event_1.VendureEntityEvent {
    // TODO: Rename to CustomerGroupEvent in v2
    constructor(ctx, entity, type, input) {
        super(entity, type, ctx, input);
    }
}
exports.CustomerGroupEntityEvent = CustomerGroupEntityEvent;
//# sourceMappingURL=customer-group-entity-event.js.map