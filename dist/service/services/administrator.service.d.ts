import { CreateAdministratorInput, DeletionResult, UpdateAdministratorInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config';
import { Administrator } from '../../entity/administrator/administrator.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { PasswordCipher } from '../helpers/password-cipher/password-cipher';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { RoleService } from './role.service';
import { UserService } from './user.service';
export declare class AdministratorService {
    private connection;
    private configService;
    private listQueryBuilder;
    private passwordCipher;
    private userService;
    private roleService;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, configService: ConfigService, listQueryBuilder: ListQueryBuilder, passwordCipher: PasswordCipher, userService: UserService, roleService: RoleService, customFieldRelationService: CustomFieldRelationService);
    initAdministrators(): Promise<void>;
    findAll(ctx: RequestContext, options?: ListQueryOptions<Administrator>): Promise<PaginatedList<Administrator>>;
    findOne(ctx: RequestContext, administratorId: ID): Promise<Administrator | undefined>;
    findOneByUserId(ctx: RequestContext, userId: ID): Promise<Administrator | undefined>;
    create(ctx: RequestContext, input: CreateAdministratorInput): Promise<Administrator>;
    update(ctx: RequestContext, input: UpdateAdministratorInput): Promise<Administrator>;
    /**
     * Assigns a Role to the Administrator's User entity.
     */
    assignRole(ctx: RequestContext, administratorId: ID, roleId: ID): Promise<Administrator>;
    softDelete(ctx: RequestContext, id: ID): Promise<{
        result: DeletionResult;
    }>;
    /**
     * There must always exist a SuperAdmin, otherwise full administration via API will
     * no longer be possible.
     */
    private ensureSuperAdminExists;
}
