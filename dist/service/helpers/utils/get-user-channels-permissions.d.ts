import { Permission } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { User } from '../../../entity/user/user.entity';
export interface UserChannelPermissions {
    id: ID;
    token: string;
    code: string;
    permissions: Permission[];
}
/**
 * Returns an array of Channels and permissions on those Channels for the given User.
 */
export declare function getUserChannelsPermissions(user: User): UserChannelPermissions[];
