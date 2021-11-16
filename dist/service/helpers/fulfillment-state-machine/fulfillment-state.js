"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fulfillmentStateTransitions = void 0;
exports.fulfillmentStateTransitions = {
    Created: {
        to: ['Pending'],
    },
    Pending: {
        to: ['Shipped', 'Delivered', 'Cancelled'],
    },
    Shipped: {
        to: ['Delivered', 'Cancelled'],
    },
    Delivered: {
        to: ['Cancelled'],
    },
    Cancelled: {
        to: [],
    },
};
//# sourceMappingURL=fulfillment-state.js.map