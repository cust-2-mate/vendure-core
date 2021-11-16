"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyXGetYFreeAction = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const utils_1 = require("../../../common/utils");
const buy_x_get_y_free_condition_1 = require("../conditions/buy-x-get-y-free-condition");
const promotion_action_1 = require("../promotion-action");
exports.buyXGetYFreeAction = new promotion_action_1.PromotionItemAction({
    code: 'buy_x_get_y_free',
    description: [
        {
            languageCode: generated_types_1.LanguageCode.en,
            value: 'Buy { amountX } of { variantIdsX } products, get { amountY } of { variantIdsY } products free',
        },
    ],
    args: {},
    conditions: [buy_x_get_y_free_condition_1.buyXGetYFreeCondition],
    execute(ctx, orderItem, orderLine, args, state) {
        const freeItemIds = state.buy_x_get_y_free.freeItemIds;
        if (idsContainsItem(freeItemIds, orderItem)) {
            const unitPrice = ctx.channel.pricesIncludeTax ? orderLine.unitPriceWithTax : orderLine.unitPrice;
            return -unitPrice;
        }
        return 0;
    },
});
function idsContainsItem(ids, item) {
    return !!ids.find(id => utils_1.idsAreEqual(id, item.id));
}
//# sourceMappingURL=buy-x-get-y-free-action.js.map