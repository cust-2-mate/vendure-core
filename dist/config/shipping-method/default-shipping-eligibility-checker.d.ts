import { LanguageCode } from '@vendure/common/lib/generated-types';
import { ShippingEligibilityChecker } from './shipping-eligibility-checker';
export declare const defaultShippingEligibilityChecker: ShippingEligibilityChecker<{
    orderMinimum: {
        type: "int";
        defaultValue: number;
        ui: {
            component: "currency-form-input";
        };
        label: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
        description: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
}>;
