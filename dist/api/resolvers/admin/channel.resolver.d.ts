import { CreateChannelResult, DeletionResponse, MutationCreateChannelArgs, MutationDeleteChannelArgs, MutationUpdateChannelArgs, QueryChannelArgs, UpdateChannelResult } from '@vendure/common/lib/generated-types';
import { ErrorResultUnion } from '../../../common/error/error-result';
import { Channel } from '../../../entity/channel/channel.entity';
import { ChannelService } from '../../../service/services/channel.service';
import { RoleService } from '../../../service/services/role.service';
import { RequestContext } from '../../common/request-context';
export declare class ChannelResolver {
    private channelService;
    private roleService;
    constructor(channelService: ChannelService, roleService: RoleService);
    channels(ctx: RequestContext): Promise<Channel[]>;
    channel(ctx: RequestContext, args: QueryChannelArgs): Promise<Channel | undefined>;
    activeChannel(ctx: RequestContext): Promise<Channel>;
    createChannel(ctx: RequestContext, args: MutationCreateChannelArgs): Promise<ErrorResultUnion<CreateChannelResult, Channel>>;
    updateChannel(ctx: RequestContext, args: MutationUpdateChannelArgs): Promise<ErrorResultUnion<UpdateChannelResult, Channel>>;
    deleteChannel(ctx: RequestContext, args: MutationDeleteChannelArgs): Promise<DeletionResponse>;
}
