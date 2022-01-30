import { LanguageCode } from '@vendure/common/lib/generated-types';
import { Injector } from '../../common/injector';
import { CustomFieldConfig } from '../../config/custom-field/custom-field-types';
/**
 * Validates the value of a custom field input against any configured constraints.
 * If validation fails, an error is thrown.
 */
export declare function validateCustomFieldValue(config: CustomFieldConfig, value: any | any[], injector: Injector, languageCode?: LanguageCode): Promise<void>;
