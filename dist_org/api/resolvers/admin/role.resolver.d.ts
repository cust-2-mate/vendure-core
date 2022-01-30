import { DeletionResponse, MutationCreateRoleArgs, MutationDeleteRoleArgs, MutationUpdateRoleArgs, QueryRoleArgs, QueryRolesArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Role } from '../../../entity/role/role.entity';
import { RoleService } from '../../../service/services/role.service';
import { RequestContext } from '../../common/request-context';
export declare class RoleResolver {
    private roleService;
    constructor(roleService: RoleService);
    roles(ctx: RequestContext, args: QueryRolesArgs): Promise<PaginatedList<Role>>;
    role(ctx: RequestContext, args: QueryRoleArgs): Promise<Role | undefined>;
    createRole(ctx: RequestContext, args: MutationCreateRoleArgs): Promise<Role>;
    updateRole(ctx: RequestContext, args: MutationUpdateRoleArgs): Promise<Role>;
    deleteRole(ctx: RequestContext, args: MutationDeleteRoleArgs): Promise<DeletionResponse>;
}
