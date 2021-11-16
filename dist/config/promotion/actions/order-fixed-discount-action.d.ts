import { PromotionOrderAction } from '../promotion-action';
export declare const orderFixedDiscount: PromotionOrderAction<{
    discount: {
        type: "int";
        ui: {
            component: "currency-form-input";
        };
    };
}, []>;
