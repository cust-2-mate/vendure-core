import { CreateRoleInput, DeletionResponse, Permission, UpdateRoleInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { Channel } from '../../entity/channel/channel.entity';
import { Role } from '../../entity/role/role.entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
export declare class RoleService {
    private connection;
    private channelService;
    private listQueryBuilder;
    private configService;
    constructor(connection: TransactionalConnection, channelService: ChannelService, listQueryBuilder: ListQueryBuilder, configService: ConfigService);
    initRoles(): Promise<void>;
    findAll(ctx: RequestContext, options?: ListQueryOptions<Role>): Promise<PaginatedList<Role>>;
    findOne(ctx: RequestContext, roleId: ID): Promise<Role | undefined>;
    getChannelsForRole(ctx: RequestContext, roleId: ID): Promise<Channel[]>;
    getSuperAdminRole(): Promise<Role>;
    getCustomerRole(): Promise<Role>;
    /**
     * Returns all the valid Permission values
     */
    getAllPermissions(): string[];
    /**
     * Returns true if the User has the specified permission on that Channel
     */
    userHasPermissionOnChannel(ctx: RequestContext, channelId: ID, permission: Permission): Promise<boolean>;
    create(ctx: RequestContext, input: CreateRoleInput): Promise<Role>;
    update(ctx: RequestContext, input: UpdateRoleInput): Promise<Role>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    assignRoleToChannel(ctx: RequestContext, roleId: ID, channelId: ID): Promise<void>;
    private getPermittedChannels;
    private checkPermissionsAreValid;
    private getRoleByCode;
    /**
     * Ensure that the SuperAdmin role exists and that it has all possible Permissions.
     */
    private ensureSuperAdminRoleExists;
    /**
     * The Customer Role is a special case which must always exist.
     */
    private ensureCustomerRoleExists;
    /**
     * Since custom permissions can be added and removed by config, there may exist one or more Roles with
     * invalid permissions (i.e. permissions that were set previously to a custom permission, which has been
     * subsequently removed from config). This method should run on startup to ensure that any such invalid
     * permissions are removed from those Roles.
     */
    private ensureRolesHaveValidPermissions;
    private createRoleForChannels;
    private getAllAssignablePermissions;
}
