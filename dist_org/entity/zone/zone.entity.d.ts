import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
import { Country } from '../country/country.entity';
/**
 * @description
 * A Zone is a grouping of one or more {@link Country} entities. It is used for
 * calculating applicable shipping and taxes.
 *
 * @docsCategory entities
 */
export declare class Zone extends VendureEntity {
    constructor(input?: DeepPartial<Zone>);
    name: string;
    members: Country[];
}
