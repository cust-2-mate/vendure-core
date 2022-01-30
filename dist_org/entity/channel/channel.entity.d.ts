import { CurrencyCode, LanguageCode } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { CustomChannelFields } from '../custom-entity-fields';
import { Zone } from '../zone/zone.entity';
/**
 * @description
 * A Channel represents a distinct sales channel and configures defaults for that
 * channel.
 *
 * @docsCategory entities
 */
export declare class Channel extends VendureEntity {
    constructor(input?: DeepPartial<Channel>);
    code: string;
    token: string;
    defaultLanguageCode: LanguageCode;
    defaultTaxZone: Zone;
    defaultShippingZone: Zone;
    currencyCode: CurrencyCode;
    customFields: CustomChannelFields;
    pricesIncludeTax: boolean;
    private generateToken;
}
