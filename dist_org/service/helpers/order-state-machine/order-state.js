"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStateTransitions = void 0;
exports.orderStateTransitions = {
    Created: {
        to: ['AddingItems'],
    },
    AddingItems: {
        to: ['ArrangingPayment', 'Cancelled'],
    },
    ArrangingPayment: {
        to: ['PaymentAuthorized', 'PaymentSettled', 'AddingItems', 'Cancelled'],
    },
    PaymentAuthorized: {
        to: ['PaymentSettled', 'Cancelled', 'Modifying', 'ArrangingAdditionalPayment'],
    },
    PaymentSettled: {
        to: [
            'PartiallyDelivered',
            'Delivered',
            'PartiallyShipped',
            'Shipped',
            'Cancelled',
            'Modifying',
            'ArrangingAdditionalPayment',
        ],
    },
    PartiallyShipped: {
        to: ['Shipped', 'PartiallyDelivered', 'Cancelled', 'Modifying'],
    },
    Shipped: {
        to: ['PartiallyDelivered', 'Delivered', 'Cancelled', 'Modifying'],
    },
    PartiallyDelivered: {
        to: ['Delivered', 'Cancelled', 'Modifying'],
    },
    Delivered: {
        to: ['Cancelled'],
    },
    Modifying: {
        to: [
            'PaymentAuthorized',
            'PaymentSettled',
            'PartiallyShipped',
            'Shipped',
            'PartiallyDelivered',
            'ArrangingAdditionalPayment',
        ],
    },
    ArrangingAdditionalPayment: {
        to: [
            'PaymentAuthorized',
            'PaymentSettled',
            'PartiallyShipped',
            'Shipped',
            'PartiallyDelivered',
            'Cancelled',
        ],
    },
    Cancelled: {
        to: [],
    },
};
//# sourceMappingURL=order-state.js.map