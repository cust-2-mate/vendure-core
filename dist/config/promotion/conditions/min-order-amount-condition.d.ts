import { PromotionCondition } from '../promotion-condition';
export declare const minimumOrderAmount: PromotionCondition<{
    amount: {
        type: "int";
        defaultValue: number;
        ui: {
            component: "currency-form-input";
        };
    };
    taxInclusive: {
        type: "boolean";
        defaultValue: false;
    };
}, "minimum_order_amount", boolean>;
