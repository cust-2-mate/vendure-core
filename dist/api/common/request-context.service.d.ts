import { Permission } from '@vendure/common/lib/generated-types';
import { Request } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { ConfigService } from '../../config/config.service';
import { CachedSession } from '../../config/session-cache/session-cache-strategy';
import { ChannelService } from '../../service/services/channel.service';
import { RequestContext } from './request-context';
/**
 * Creates new RequestContext instances.
 */
export declare class RequestContextService {
    private channelService;
    private configService;
    constructor(channelService: ChannelService, configService: ConfigService);
    /**
     * Creates a new RequestContext based on an Express request object.
     */
    fromRequest(req: Request, info?: GraphQLResolveInfo, requiredPermissions?: Permission[], session?: CachedSession): Promise<RequestContext>;
    private getChannelToken;
    private getLanguageCode;
    /**
     * TODO: Deprecate and remove, since this function is now handled internally in the RequestContext.
     * @private
     */
    private userHasRequiredPermissionsOnChannel;
    /**
     * Returns true if any element of arr1 appears in arr2.
     */
    private arraysIntersect;
}
