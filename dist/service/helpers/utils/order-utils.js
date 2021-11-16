"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderItemsAreAllCancelled = exports.orderItemsAreShipped = exports.orderItemsArePartiallyShipped = exports.orderItemsArePartiallyDelivered = exports.orderItemsAreDelivered = exports.totalCoveredByPayments = exports.orderTotalIsCovered = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
/**
 * Returns true if the Order total is covered by Payments in the specified state.
 */
function orderTotalIsCovered(order, state) {
    const paymentsTotal = totalCoveredByPayments(order, state);
    return paymentsTotal === order.totalWithTax;
}
exports.orderTotalIsCovered = orderTotalIsCovered;
/**
 * Returns the total amount covered by all Payments (minus any refunds)
 */
function totalCoveredByPayments(order, state) {
    const payments = state
        ? Array.isArray(state)
            ? order.payments.filter(p => state.includes(p.state))
            : order.payments.filter(p => p.state === state)
        : order.payments.filter(p => p.state !== 'Error' && p.state !== 'Declined' && p.state !== 'Cancelled');
    let total = 0;
    for (const payment of payments) {
        const refundTotal = shared_utils_1.summate(payment.refunds, 'total');
        total += payment.amount - Math.abs(refundTotal);
    }
    return total;
}
exports.totalCoveredByPayments = totalCoveredByPayments;
/**
 * Returns true if all (non-cancelled) OrderItems are delivered.
 */
function orderItemsAreDelivered(order) {
    return getOrderItems(order)
        .filter(orderItem => !orderItem.cancelled)
        .every(isDelivered);
}
exports.orderItemsAreDelivered = orderItemsAreDelivered;
/**
 * Returns true if at least one, but not all (non-cancelled) OrderItems are delivered.
 */
function orderItemsArePartiallyDelivered(order) {
    const nonCancelledItems = getNonCancelledItems(order);
    return nonCancelledItems.some(isDelivered) && !nonCancelledItems.every(isDelivered);
}
exports.orderItemsArePartiallyDelivered = orderItemsArePartiallyDelivered;
/**
 * Returns true if at least one, but not all (non-cancelled) OrderItems are shipped.
 */
function orderItemsArePartiallyShipped(order) {
    const nonCancelledItems = getNonCancelledItems(order);
    return nonCancelledItems.some(isShipped) && !nonCancelledItems.every(isShipped);
}
exports.orderItemsArePartiallyShipped = orderItemsArePartiallyShipped;
/**
 * Returns true if all (non-cancelled) OrderItems are shipped.
 */
function orderItemsAreShipped(order) {
    return getOrderItems(order)
        .filter(orderItem => !orderItem.cancelled)
        .every(isShipped);
}
exports.orderItemsAreShipped = orderItemsAreShipped;
/**
 * Returns true if all OrderItems in the order are cancelled
 */
function orderItemsAreAllCancelled(order) {
    return getOrderItems(order).every(orderItem => orderItem.cancelled);
}
exports.orderItemsAreAllCancelled = orderItemsAreAllCancelled;
function getOrderItems(order) {
    return order.lines.reduce((orderItems, line) => [...orderItems, ...line.items], []);
}
function getNonCancelledItems(order) {
    return getOrderItems(order).filter(orderItem => !orderItem.cancelled);
}
function isDelivered(orderItem) {
    var _a;
    return ((_a = orderItem.fulfillment) === null || _a === void 0 ? void 0 : _a.state) === 'Delivered';
}
function isShipped(orderItem) {
    var _a;
    return ((_a = orderItem.fulfillment) === null || _a === void 0 ? void 0 : _a.state) === 'Shipped';
}
//# sourceMappingURL=order-utils.js.map