import { ConfigurableOperation } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { ChannelAware } from '../../common/types/common-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { VendureEntity } from '../base/base.entity';
import { Channel } from '../channel/channel.entity';
import { CustomPaymentMethodFields } from '../custom-entity-fields';
/**
 * @description
 * A PaymentMethod is created automatically according to the configured {@link PaymentMethodHandler}s defined
 * in the {@link PaymentOptions} config.
 *
 * @docsCategory entities
 */
export declare class PaymentMethod extends VendureEntity implements ChannelAware, HasCustomFields {
    constructor(input?: DeepPartial<PaymentMethod>);
    name: string;
    code: string;
    description: string;
    enabled: boolean;
    checker: ConfigurableOperation | null;
    handler: ConfigurableOperation;
    channels: Channel[];
    customFields: CustomPaymentMethodFields;
}
