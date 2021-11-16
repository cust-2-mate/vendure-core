import { LanguageCode } from '@vendure/common/lib/generated-types';
import { ShippingCalculator } from './shipping-calculator';
declare enum TaxSetting {
    include = "include",
    exclude = "exclude",
    auto = "auto"
}
export declare const defaultShippingCalculator: ShippingCalculator<{
    rate: {
        type: "int";
        defaultValue: number;
        ui: {
            component: "currency-form-input";
        };
        label: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
    includesTax: {
        type: "string";
        defaultValue: TaxSetting;
        ui: {
            component: "select-form-input";
            options: {
                label: {
                    languageCode: LanguageCode.en;
                    value: string;
                }[];
                value: TaxSetting;
            }[];
        };
        label: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
    taxRate: {
        type: "int";
        defaultValue: number;
        ui: {
            component: "number-form-input";
            suffix: string;
        };
        label: {
            languageCode: LanguageCode.en;
            value: string;
        }[];
    };
}>;
export {};
