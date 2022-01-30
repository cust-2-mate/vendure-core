import { LanguageCode } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Translation } from '../../common/types/locale-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { VendureEntity } from '../base/base.entity';
import { CustomCountryFieldsTranslation } from '../custom-entity-fields';
import { Country } from './country.entity';
export declare class CountryTranslation extends VendureEntity implements Translation<Country>, HasCustomFields {
    constructor(input?: DeepPartial<Translation<CountryTranslation>>);
    languageCode: LanguageCode;
    name: string;
    base: Country;
    customFields: CustomCountryFieldsTranslation;
}
