"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentStateTransitions = void 0;
exports.paymentStateTransitions = {
    Created: {
        to: ['Authorized', 'Settled', 'Declined', 'Error', 'Cancelled'],
    },
    Authorized: {
        to: ['Settled', 'Error', 'Cancelled'],
    },
    Settled: {
        to: ['Cancelled'],
    },
    Declined: {
        to: ['Cancelled'],
    },
    Error: {
        to: ['Cancelled'],
    },
    Cancelled: {
        to: [],
    },
};
//# sourceMappingURL=payment-state.js.map