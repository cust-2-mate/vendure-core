import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '../base/base.entity';
/**
 * @description
 * A TaxCategory defines what type of taxes to apply to a {@link ProductVariant}.
 *
 * @docsCategory entities
 */
export declare class TaxCategory extends VendureEntity {
    constructor(input?: DeepPartial<TaxCategory>);
    name: string;
    isDefault: boolean;
}
