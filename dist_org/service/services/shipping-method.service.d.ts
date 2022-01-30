import { ConfigurableOperationDefinition, CreateShippingMethodInput, DeletionResponse, UpdateShippingMethodInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { Channel } from '../../entity/channel/channel.entity';
import { ShippingMethod } from '../../entity/shipping-method/shipping-method.entity';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
export declare class ShippingMethodService {
    private connection;
    private configService;
    private listQueryBuilder;
    private channelService;
    private configArgService;
    private translatableSaver;
    private customFieldRelationService;
    private activeShippingMethods;
    constructor(connection: TransactionalConnection, configService: ConfigService, listQueryBuilder: ListQueryBuilder, channelService: ChannelService, configArgService: ConfigArgService, translatableSaver: TranslatableSaver, customFieldRelationService: CustomFieldRelationService);
    initShippingMethods(): Promise<void>;
    findAll(ctx: RequestContext, options?: ListQueryOptions<ShippingMethod>): Promise<PaginatedList<ShippingMethod>>;
    findOne(ctx: RequestContext, shippingMethodId: ID, includeDeleted?: boolean): Promise<ShippingMethod | undefined>;
    create(ctx: RequestContext, input: CreateShippingMethodInput): Promise<ShippingMethod>;
    update(ctx: RequestContext, input: UpdateShippingMethodInput): Promise<ShippingMethod>;
    softDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    getShippingEligibilityCheckers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getShippingCalculators(ctx: RequestContext): ConfigurableOperationDefinition[];
    getFulfillmentHandlers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getActiveShippingMethods(channel: Channel): ShippingMethod[];
    /**
     * Ensures that all ShippingMethods have a valid fulfillmentHandlerCode
     */
    private verifyShippingMethods;
    private updateActiveShippingMethods;
    private ensureValidFulfillmentHandlerCode;
}
