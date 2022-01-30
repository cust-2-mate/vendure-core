import { CreateChannelInput, CreateChannelResult, DeletionResponse, UpdateChannelInput, UpdateChannelResult } from '@vendure/common/lib/generated-types';
import { ID, Type } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion } from '../../common/error/error-result';
import { ChannelAware } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { VendureEntity } from '../../entity/base/base.entity';
import { Channel } from '../../entity/channel/channel.entity';
import { EventBus } from '../../event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { GlobalSettingsService } from './global-settings.service';
/**
 * @description
 * Contains methods relating to {@link Channel} entities.
 *
 * @docsCategory services
 */
export declare class ChannelService {
    private connection;
    private configService;
    private globalSettingsService;
    private customFieldRelationService;
    private eventBus;
    private allChannels;
    constructor(connection: TransactionalConnection, configService: ConfigService, globalSettingsService: GlobalSettingsService, customFieldRelationService: CustomFieldRelationService, eventBus: EventBus);
    /**
     * When the app is bootstrapped, ensure a default Channel exists and populate the
     * channel lookup array.
     *
     * @internal
     */
    initChannels(): Promise<void>;
    /**
     * @description
     * Assigns a ChannelAware entity to the default Channel as well as any channel
     * specified in the RequestContext.
     */
    assignToCurrentChannel<T extends ChannelAware & VendureEntity>(entity: T, ctx: RequestContext): Promise<T>;
    /**
     * @description
     * Assigns the entity to the given Channels and saves.
     */
    assignToChannels<T extends ChannelAware & VendureEntity>(ctx: RequestContext, entityType: Type<T>, entityId: ID, channelIds: ID[]): Promise<T>;
    /**
     * @description
     * Removes the entity from the given Channels and saves.
     */
    removeFromChannels<T extends ChannelAware & VendureEntity>(ctx: RequestContext, entityType: Type<T>, entityId: ID, channelIds: ID[]): Promise<T | undefined>;
    /**
     * @description
     * Given a channel token, returns the corresponding Channel if it exists, else will throw
     * a {@link ChannelNotFoundError}.
     */
    getChannelFromToken(token: string): Promise<Channel>;
    /**
     * @description
     * Returns the default Channel.
     */
    getDefaultChannel(): Promise<Channel>;
    findAll(ctx: RequestContext): Promise<Channel[]>;
    findOne(ctx: RequestContext, id: ID): Promise<Channel | undefined>;
    create(ctx: RequestContext, input: CreateChannelInput): Promise<ErrorResultUnion<CreateChannelResult, Channel>>;
    update(ctx: RequestContext, input: UpdateChannelInput): Promise<ErrorResultUnion<UpdateChannelResult, Channel>>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    /**
     * @description
     * Type guard method which returns true if the given entity is an
     * instance of a class which implements the {@link ChannelAware} interface.
     */
    isChannelAware(entity: VendureEntity): entity is VendureEntity & ChannelAware;
    /**
     * There must always be a default Channel. If none yet exists, this method creates one.
     * Also ensures the default Channel token matches the defaultChannelToken config setting.
     */
    private ensureDefaultChannelExists;
    private validateDefaultLanguageCode;
}
