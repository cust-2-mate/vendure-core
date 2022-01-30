import { LanguageCode } from '@vendure/common/lib/generated-types';
import { PromotionCondition } from '../promotion-condition';
export declare const customerGroup: PromotionCondition<{
    customerGroupId: {
        type: "ID";
        ui: {
            component: "customer-group-form-input";
        };
        label: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
}, "customer_group", boolean>;
