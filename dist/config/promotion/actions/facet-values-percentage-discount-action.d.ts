import { PromotionItemAction } from '../promotion-action';
export declare const discountOnItemWithFacets: PromotionItemAction<{
    discount: {
        type: "int";
        ui: {
            component: "number-form-input";
            suffix: string;
        };
    };
    facets: {
        type: "ID";
        list: true;
        ui: {
            component: "facet-value-form-input";
        };
    };
}, []>;
