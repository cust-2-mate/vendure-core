import { DeepPartial } from '@vendure/common/lib/shared-types';
import { LocaleString, Translatable, Translation } from '../../common/types/locale-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { VendureEntity } from '../base/base.entity';
import { CustomCountryFields } from '../custom-entity-fields';
/**
 * @description
 * A country to which is available when creating / updating an {@link Address}. Countries are
 * grouped together into {@link Zone}s which are in turn used to determine applicable shipping
 * and taxes for an {@link Order}.
 *
 * @docsCategory entities
 */
export declare class Country extends VendureEntity implements Translatable, HasCustomFields {
    constructor(input?: DeepPartial<Country>);
    code: string;
    name: LocaleString;
    enabled: boolean;
    translations: Array<Translation<Country>>;
    customFields: CustomCountryFields;
}
