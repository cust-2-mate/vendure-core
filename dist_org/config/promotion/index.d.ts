export * from './promotion-action';
export * from './promotion-condition';
export * from './actions/facet-values-percentage-discount-action';
export * from './actions/order-percentage-discount-action';
export * from './actions/product-percentage-discount-action';
export * from './conditions/has-facet-values-condition';
export * from './conditions/min-order-amount-condition';
export * from './conditions/contains-products-condition';
export * from './conditions/customer-group-condition';
export * from './utils/facet-value-checker';
export declare const defaultPromotionActions: (import("./promotion-action").PromotionItemAction<{}, import("./promotion-condition").PromotionCondition<{
    amountX: {
        type: "int";
        defaultValue: number;
    };
    variantIdsX: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
    amountY: {
        type: "int";
        defaultValue: number;
    };
    variantIdsY: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
}, "buy_x_get_y_free", false | {
    freeItemIds: import("@vendure/common/lib/shared-types").ID[];
}>[]> | import("./promotion-action").PromotionItemAction<{
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
}, []> | import("./promotion-action").PromotionShippingAction<{}, []> | import("./promotion-action").PromotionOrderAction<{
    discount: {
        type: "int";
        ui: {
            component: "currency-form-input";
        };
    };
}, []> | import("./promotion-action").PromotionOrderAction<{
    discount: {
        type: "int";
        ui: {
            component: "number-form-input";
            suffix: string;
        };
    };
}, []> | import("./promotion-action").PromotionItemAction<{
    discount: {
        type: "int";
        ui: {
            component: "number-form-input";
            suffix: string;
        };
    };
    productVariantIds: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
}, []>)[];
export declare const defaultPromotionConditions: (import("./promotion-condition").PromotionCondition<{
    amountX: {
        type: "int";
        defaultValue: number;
    };
    variantIdsX: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
    amountY: {
        type: "int";
        defaultValue: number;
    };
    variantIdsY: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
}, "buy_x_get_y_free", false | {
    freeItemIds: import("@vendure/common/lib/shared-types").ID[];
}> | import("./promotion-condition").PromotionCondition<{
    minimum: {
        type: "int";
        defaultValue: number;
    };
    productVariantIds: {
        type: "ID";
        list: true;
        ui: {
            component: "product-selector-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
}, "contains_products", boolean> | import("./promotion-condition").PromotionCondition<{
    customerGroupId: {
        type: "ID";
        ui: {
            component: "customer-group-form-input";
        };
        label: {
            languageCode: import("@vendure/common/lib/generated-types").LanguageCode.en;
            value: string;
        }[];
    };
}, "customer_group", boolean> | import("./promotion-condition").PromotionCondition<{
    minimum: {
        type: "int";
        defaultValue: number;
    };
    facets: {
        type: "ID";
        list: true;
        ui: {
            component: "facet-value-form-input";
        };
    };
}, "at_least_n_with_facets", boolean> | import("./promotion-condition").PromotionCondition<{
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
}, "minimum_order_amount", boolean>)[];
