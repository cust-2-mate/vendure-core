import { CreateChannelInput, CreateChannelResult, DeletionResponse, UpdateChannelInput, UpdateChannelResult } from '@vendure/common/lib/generated-types';
import { ID, Type } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion } from '../../common/error/error-result';
import { ChannelAware } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { VendureEntity } from '../../entity/base/base.entity';
import { Channel } from '../../entity/channel/channel.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { GlobalSettingsService } from './global-settings.service';
export declare class ChannelService {
    private connection;
    private configService;
    private globalSettingsService;
    private customFieldRelationService;
    private allChannels;
    constructor(connection: TransactionalConnection, configService: ConfigService, globalSettingsService: GlobalSettingsService, customFieldRelationService: CustomFieldRelationService);
    /**
     * When the app is bootstrapped, ensure a default Channel exists and populate the
     * channel lookup array.
     */
    initChannels(): Promise<void>;
    /**
     * Assigns a ChannelAware entity to the default Channel as well as any channel
     * specified in the RequestContext.
     */
    assignToCurrentChannel<T extends ChannelAware>(entity: T, ctx: RequestContext): T;
    /**
     * Assigns the entity to the given Channels and saves.
     */
    assignToChannels<T extends ChannelAware & VendureEntity>(ctx: RequestContext, entityType: Type<T>, entityId: ID, channelIds: ID[]): Promise<T>;
    /**
     * Removes the entity from the given Channels and saves.
     */
    removeFromChannels<T extends ChannelAware & VendureEntity>(ctx: RequestContext, entityType: Type<T>, entityId: ID, channelIds: ID[]): Promise<T | undefined>;
    /**
     * Given a channel token, returns the corresponding Channel if it exists.
     */
    getChannelFromToken(token: string): Channel;
    /**
     * Returns the default Channel.
     */
    getDefaultChannel(): Channel;
    findAll(ctx: RequestContext): Promise<Channel[]>;
    findOne(ctx: RequestContext, id: ID): Promise<Channel | undefined>;
    create(ctx: RequestContext, input: CreateChannelInput): Promise<ErrorResultUnion<CreateChannelResult, Channel>>;
    update(ctx: RequestContext, input: UpdateChannelInput): Promise<ErrorResultUnion<UpdateChannelResult, Channel>>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    isChannelAware(entity: VendureEntity): entity is VendureEntity & ChannelAware;
    /**
     * There must always be a default Channel. If none yet exists, this method creates one.
     * Also ensures the default Channel token matches the defaultChannelToken config setting.
     */
    private ensureDefaultChannelExists;
    private validateDefaultLanguageCode;
    private updateAllChannels;
}
