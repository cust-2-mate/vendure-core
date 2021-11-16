import { LanguageCode } from '@vendure/common/lib/generated-types';
import { PromotionItemAction } from '../promotion-action';
export declare const productsPercentageDiscount: PromotionItemAction<{
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
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
}, []>;
