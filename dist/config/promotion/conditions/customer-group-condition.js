"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerGroup = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const ttl_cache_1 = require("../../../common/ttl-cache");
const utils_1 = require("../../../common/utils");
const event_bus_1 = require("../../../event-bus/event-bus");
const customer_group_event_1 = require("../../../event-bus/events/customer-group-event");
const promotion_condition_1 = require("../promotion-condition");
let customerService;
let subscription;
const fiveMinutes = 5 * 60 * 1000;
const cache = new ttl_cache_1.TtlCache({ ttl: fiveMinutes });
exports.customerGroup = new promotion_condition_1.PromotionCondition({
    code: 'customer_group',
    description: [{ languageCode: generated_types_1.LanguageCode.en, value: 'Customer is a member of the specified group' }],
    args: {
        customerGroupId: {
            type: 'ID',
            ui: { component: 'customer-group-form-input' },
            label: [{ languageCode: generated_types_1.LanguageCode.en, value: 'Customer group' }],
        },
    },
    async init(injector) {
        // Lazily-imported to avoid circular dependency issues.
        const { CustomerService } = await Promise.resolve().then(() => __importStar(require('../../../service/services/customer.service')));
        customerService = injector.get(CustomerService);
        subscription = injector
            .get(event_bus_1.EventBus)
            .ofType(customer_group_event_1.CustomerGroupEvent)
            .subscribe(event => {
            // When a customer is added to or removed from a group, we need
            // to invalidate the cache for that customer id
            for (const customer of event.customers) {
                cache.delete(customer.id);
            }
        });
    },
    destroy() {
        subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
    },
    async check(ctx, order, args) {
        if (!order.customer) {
            return false;
        }
        const customerId = order.customer.id;
        let groupIds = cache.get(customerId);
        if (!groupIds) {
            const groups = await customerService.getCustomerGroups(ctx, customerId);
            groupIds = groups.map(g => g.id);
            cache.set(customerId, groupIds);
        }
        return !!groupIds.find(id => utils_1.idsAreEqual(id, args.customerGroupId));
    },
});
//# sourceMappingURL=customer-group-condition.js.map