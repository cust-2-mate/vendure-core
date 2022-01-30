import { PromotionOrderAction } from '../promotion-action';
export declare const orderPercentageDiscount: PromotionOrderAction<{
    discount: {
        type: "int";
        ui: {
            component: string;
            suffix: string;
        };
    };
}, []>;
