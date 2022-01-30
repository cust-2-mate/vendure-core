import { PromotionItemAction } from '../promotion-action';
export declare const discountOnItemWithFacets: PromotionItemAction<{
    discount: {
        type: "int";
        ui: {
            component: string;
            suffix: string;
        };
    };
    facets: {
        type: "ID";
        list: true;
        ui: {
            component: string;
        };
    };
}, []>;
