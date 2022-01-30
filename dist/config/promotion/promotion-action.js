"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionShippingAction = exports.PromotionOrderAction = exports.PromotionItemAction = exports.PromotionAction = void 0;
const pick_1 = require("@vendure/common/lib/pick");
const configurable_operation_1 = require("../../common/configurable-operation");
/**
 * @description
 * An abstract class which is extended by {@link PromotionItemAction}, {@link PromotionOrderAction},
 * and {@link PromotionShippingAction}.
 *
 * @docsCategory promotions
 * @docsPage promotion-action
 * @docsWeight 0
 */
class PromotionAction extends configurable_operation_1.ConfigurableOperationDef {
    constructor(config) {
        super(config);
        this.priorityValue = config.priorityValue || 0;
        this.conditions = config.conditions;
    }
}
exports.PromotionAction = PromotionAction;
/**
 * @description
 * Represents a PromotionAction which applies to individual {@link OrderItem}s.
 *
 * @example
 * ```ts
 * // Applies a percentage discount to each OrderItem
 * const itemPercentageDiscount = new PromotionItemAction({
 *     code: 'item_percentage_discount',
 *     args: { discount: 'percentage' },
 *     execute(ctx, orderItem, orderLine, args) {
 *         return -orderLine.unitPrice * (args.discount / 100);
 *     },
 *     description: 'Discount every item by { discount }%',
 * });
 * ```
 *
 * @docsCategory promotions
 * @docsPage promotion-action
 * @docsWeight 1
 */
class PromotionItemAction extends PromotionAction {
    constructor(config) {
        super(config);
        this.executeFn = config.execute;
    }
    /** @internal */
    execute(ctx, orderItem, orderLine, args, state) {
        const actionState = this.conditions
            ? pick_1.pick(state, this.conditions.map(c => c.code))
            : {};
        return this.executeFn(ctx, orderItem, orderLine, this.argsArrayToHash(args), actionState);
    }
}
exports.PromotionItemAction = PromotionItemAction;
/**
 * @description
 * Represents a PromotionAction which applies to the {@link Order} as a whole.
 *
 * @example
 * ```ts
 * // Applies a percentage discount to the entire Order
 * const orderPercentageDiscount = new PromotionOrderAction({
 *     code: 'order_percentage_discount',
 *     args: { discount: 'percentage' },
 *     execute(ctx, order, args) {
 *         return -order.subTotal * (args.discount / 100);
 *     },
 *     description: 'Discount order by { discount }%',
 * });
 * ```
 *
 * @docsCategory promotions
 * @docsPage promotion-action
 * @docsWeight 2
 */
class PromotionOrderAction extends PromotionAction {
    constructor(config) {
        super(config);
        this.executeFn = config.execute;
    }
    /** @internal */
    execute(ctx, order, args, state) {
        const actionState = this.conditions ? pick_1.pick(state, this.conditions.map(c => c.code)) : {};
        return this.executeFn(ctx, order, this.argsArrayToHash(args), actionState);
    }
}
exports.PromotionOrderAction = PromotionOrderAction;
/**
 * @description
 * Represents a PromotionAction which applies to the shipping cost of an Order.
 *
 * @docsCategory promotions
 * @docsPage promotion-action
 * @docsWeight 3
 */
class PromotionShippingAction extends PromotionAction {
    constructor(config) {
        super(config);
        this.executeFn = config.execute;
    }
    /** @internal */
    execute(ctx, shippingLine, order, args, state) {
        const actionState = this.conditions ? pick_1.pick(state, this.conditions.map(c => c.code)) : {};
        return this.executeFn(ctx, shippingLine, order, this.argsArrayToHash(args), actionState);
    }
}
exports.PromotionShippingAction = PromotionShippingAction;
//# sourceMappingURL=promotion-action.js.map