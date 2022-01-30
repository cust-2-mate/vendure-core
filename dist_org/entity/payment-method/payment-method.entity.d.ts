import { ConfigurableOperation } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { ChannelAware } from '../../common/types/common-types';
import { VendureEntity } from '../base/base.entity';
import { Channel } from '../channel/channel.entity';
/**
 * @description
 * A PaymentMethod is created automatically according to the configured {@link PaymentMethodHandler}s defined
 * in the {@link PaymentOptions} config.
 *
 * @docsCategory entities
 */
export declare class PaymentMethod extends VendureEntity implements ChannelAware {
    constructor(input?: DeepPartial<PaymentMethod>);
    name: string;
    code: string;
    description: string;
    enabled: boolean;
    checker: ConfigurableOperation | null;
    handler: ConfigurableOperation;
    channels: Channel[];
}
