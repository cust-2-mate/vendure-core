import { ConfigurableOperationDefinition, CreateShippingMethodInput, DeletionResponse, UpdateShippingMethodInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { ShippingMethod } from '../../entity/shipping-method/shipping-method.entity';
import { EventBus } from '../../event-bus';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { ChannelService } from './channel.service';
/**
 * @description
 * Contains methods relating to {@link ShippingMethod} entities.
 *
 * @docsCategory services
 */
export declare class ShippingMethodService {
    private connection;
    private configService;
    private listQueryBuilder;
    private channelService;
    private configArgService;
    private translatableSaver;
    private customFieldRelationService;
    private eventBus;
    constructor(connection: TransactionalConnection, configService: ConfigService, listQueryBuilder: ListQueryBuilder, channelService: ChannelService, configArgService: ConfigArgService, translatableSaver: TranslatableSaver, customFieldRelationService: CustomFieldRelationService, eventBus: EventBus);
    /** @internal */
    initShippingMethods(): Promise<void>;
    findAll(ctx: RequestContext, options?: ListQueryOptions<ShippingMethod>): Promise<PaginatedList<ShippingMethod>>;
    findOne(ctx: RequestContext, shippingMethodId: ID, includeDeleted?: boolean): Promise<ShippingMethod | undefined>;
    create(ctx: RequestContext, input: CreateShippingMethodInput): Promise<ShippingMethod>;
    update(ctx: RequestContext, input: UpdateShippingMethodInput): Promise<ShippingMethod>;
    softDelete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    getShippingEligibilityCheckers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getShippingCalculators(ctx: RequestContext): ConfigurableOperationDefinition[];
    getFulfillmentHandlers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getActiveShippingMethods(ctx: RequestContext): Promise<ShippingMethod[]>;
    /**
     * Ensures that all ShippingMethods have a valid fulfillmentHandlerCode
     */
    private verifyShippingMethods;
    private ensureValidFulfillmentHandlerCode;
}
