import { DeepPartial } from '@vendure/common/lib/shared-types';
import { LocaleString, Translatable, Translation } from '../../common/types/locale-types';
import { VendureEntity } from '../base/base.entity';
/**
 * @description
 * A country to which is available when creating / updating an {@link Address}. Countries are
 * grouped together into {@link Zone}s which are in turn used to determine applicable shipping
 * and taxes for an {@link Order}.
 *
 * @docsCategory entities
 */
export declare class Country extends VendureEntity implements Translatable {
    constructor(input?: DeepPartial<Country>);
    code: string;
    name: LocaleString;
    enabled: boolean;
    translations: Array<Translation<Country>>;
}
