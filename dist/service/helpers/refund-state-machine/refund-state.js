"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundStateTransitions = void 0;
exports.refundStateTransitions = {
    Pending: {
        to: ['Settled', 'Failed'],
    },
    Settled: {
        to: [],
    },
    Failed: {
        to: [],
    },
};
//# sourceMappingURL=refund-state.js.map