"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const unique_1 = require("@vendure/common/lib/unique");
const request_context_1 = require("../../api/common/request-context");
const constants_1 = require("../../common/constants");
const errors_1 = require("../../common/error/errors");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const channel_entity_1 = require("../../entity/channel/channel.entity");
const role_entity_1 = require("../../entity/role/role.entity");
const user_entity_1 = require("../../entity/user/user.entity");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const get_user_channels_permissions_1 = require("../helpers/utils/get-user-channels-permissions");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const channel_service_1 = require("./channel.service");
let RoleService = class RoleService {
    constructor(connection, channelService, listQueryBuilder, configService) {
        this.connection = connection;
        this.channelService = channelService;
        this.listQueryBuilder = listQueryBuilder;
        this.configService = configService;
    }
    async initRoles() {
        await this.ensureSuperAdminRoleExists();
        await this.ensureCustomerRoleExists();
        await this.ensureRolesHaveValidPermissions();
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(role_entity_1.Role, options, { relations: ['channels'], ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
            items,
            totalItems,
        }));
    }
    findOne(ctx, roleId) {
        return this.connection.getRepository(ctx, role_entity_1.Role).findOne(roleId, {
            relations: ['channels'],
        });
    }
    getChannelsForRole(ctx, roleId) {
        return this.findOne(ctx, roleId).then(role => (role ? role.channels : []));
    }
    getSuperAdminRole() {
        return this.getRoleByCode(shared_constants_1.SUPER_ADMIN_ROLE_CODE).then(role => {
            if (!role) {
                throw new errors_1.InternalServerError(`error.super-admin-role-not-found`);
            }
            return role;
        });
    }
    getCustomerRole() {
        return this.getRoleByCode(shared_constants_1.CUSTOMER_ROLE_CODE).then(role => {
            if (!role) {
                throw new errors_1.InternalServerError(`error.customer-role-not-found`);
            }
            return role;
        });
    }
    /**
     * Returns all the valid Permission values
     */
    getAllPermissions() {
        return Object.values(generated_types_1.Permission);
    }
    /**
     * Returns true if the User has the specified permission on that Channel
     */
    async userHasPermissionOnChannel(ctx, channelId, permission) {
        if (ctx.activeUserId == null) {
            return false;
        }
        const user = await this.connection.getEntityOrThrow(ctx, user_entity_1.User, ctx.activeUserId, {
            relations: ['roles', 'roles.channels'],
        });
        const userChannels = get_user_channels_permissions_1.getUserChannelsPermissions(user);
        const channel = userChannels.find(c => utils_1.idsAreEqual(c.id, channelId));
        if (!channel) {
            return false;
        }
        return channel.permissions.includes(permission);
    }
    async create(ctx, input) {
        this.checkPermissionsAreValid(input.permissions);
        let targetChannels = [];
        if (input.channelIds) {
            targetChannels = await this.getPermittedChannels(ctx, input.channelIds);
        }
        else {
            targetChannels = [ctx.channel];
        }
        return this.createRoleForChannels(ctx, input, targetChannels);
    }
    async update(ctx, input) {
        this.checkPermissionsAreValid(input.permissions);
        const role = await this.findOne(ctx, input.id);
        if (!role) {
            throw new errors_1.EntityNotFoundError('Role', input.id);
        }
        if (role.code === shared_constants_1.SUPER_ADMIN_ROLE_CODE || role.code === shared_constants_1.CUSTOMER_ROLE_CODE) {
            throw new errors_1.InternalServerError(`error.cannot-modify-role`, { roleCode: role.code });
        }
        const updatedRole = patch_entity_1.patchEntity(role, {
            code: input.code,
            description: input.description,
            permissions: input.permissions
                ? unique_1.unique([generated_types_1.Permission.Authenticated, ...input.permissions])
                : undefined,
        });
        if (input.channelIds && ctx.activeUserId) {
            updatedRole.channels = await this.getPermittedChannels(ctx, input.channelIds);
        }
        await this.connection.getRepository(ctx, role_entity_1.Role).save(updatedRole, { reload: false });
        return utils_1.assertFound(this.findOne(ctx, role.id));
    }
    async delete(ctx, id) {
        const role = await this.findOne(ctx, id);
        if (!role) {
            throw new errors_1.EntityNotFoundError('Role', id);
        }
        if (role.code === shared_constants_1.SUPER_ADMIN_ROLE_CODE || role.code === shared_constants_1.CUSTOMER_ROLE_CODE) {
            throw new errors_1.InternalServerError(`error.cannot-delete-role`, { roleCode: role.code });
        }
        await this.connection.getRepository(ctx, role_entity_1.Role).remove(role);
        return {
            result: generated_types_1.DeletionResult.DELETED,
        };
    }
    async assignRoleToChannel(ctx, roleId, channelId) {
        await this.channelService.assignToChannels(ctx, role_entity_1.Role, roleId, [channelId]);
    }
    async getPermittedChannels(ctx, channelIds) {
        let permittedChannels = [];
        for (const channelId of channelIds) {
            const channel = await this.connection.getEntityOrThrow(ctx, channel_entity_1.Channel, channelId);
            const hasPermission = await this.userHasPermissionOnChannel(ctx, channelId, generated_types_1.Permission.CreateAdministrator);
            if (!hasPermission) {
                throw new errors_1.ForbiddenError();
            }
            permittedChannels = [...permittedChannels, channel];
        }
        return permittedChannels;
    }
    checkPermissionsAreValid(permissions) {
        if (!permissions) {
            return;
        }
        const allAssignablePermissions = this.getAllAssignablePermissions();
        for (const permission of permissions) {
            if (!allAssignablePermissions.includes(permission) || permission === generated_types_1.Permission.SuperAdmin) {
                throw new errors_1.UserInputError('error.permission-invalid', { permission });
            }
        }
    }
    getRoleByCode(code) {
        return this.connection.getRepository(role_entity_1.Role).findOne({
            where: { code },
        });
    }
    /**
     * Ensure that the SuperAdmin role exists and that it has all possible Permissions.
     */
    async ensureSuperAdminRoleExists() {
        const assignablePermissions = this.getAllAssignablePermissions();
        try {
            const superAdminRole = await this.getSuperAdminRole();
            superAdminRole.permissions = assignablePermissions;
            await this.connection.getRepository(role_entity_1.Role).save(superAdminRole, { reload: false });
        }
        catch (err) {
            await this.createRoleForChannels(request_context_1.RequestContext.empty(), {
                code: shared_constants_1.SUPER_ADMIN_ROLE_CODE,
                description: shared_constants_1.SUPER_ADMIN_ROLE_DESCRIPTION,
                permissions: assignablePermissions,
            }, [this.channelService.getDefaultChannel()]);
        }
    }
    /**
     * The Customer Role is a special case which must always exist.
     */
    async ensureCustomerRoleExists() {
        try {
            await this.getCustomerRole();
        }
        catch (err) {
            await this.createRoleForChannels(request_context_1.RequestContext.empty(), {
                code: shared_constants_1.CUSTOMER_ROLE_CODE,
                description: shared_constants_1.CUSTOMER_ROLE_DESCRIPTION,
                permissions: [generated_types_1.Permission.Authenticated],
            }, [this.channelService.getDefaultChannel()]);
        }
    }
    /**
     * Since custom permissions can be added and removed by config, there may exist one or more Roles with
     * invalid permissions (i.e. permissions that were set previously to a custom permission, which has been
     * subsequently removed from config). This method should run on startup to ensure that any such invalid
     * permissions are removed from those Roles.
     */
    async ensureRolesHaveValidPermissions() {
        const roles = await this.connection.getRepository(role_entity_1.Role).find();
        const assignablePermissions = this.getAllAssignablePermissions();
        for (const role of roles) {
            const invalidPermissions = role.permissions.filter(p => !assignablePermissions.includes(p));
            if (invalidPermissions.length) {
                role.permissions = role.permissions.filter(p => assignablePermissions.includes(p));
                await this.connection.getRepository(role_entity_1.Role).save(role);
            }
        }
    }
    createRoleForChannels(ctx, input, channels) {
        const role = new role_entity_1.Role({
            code: input.code,
            description: input.description,
            permissions: unique_1.unique([generated_types_1.Permission.Authenticated, ...input.permissions]),
        });
        role.channels = channels;
        return this.connection.getRepository(ctx, role_entity_1.Role).save(role);
    }
    getAllAssignablePermissions() {
        return constants_1.getAllPermissionsMetadata(this.configService.authOptions.customPermissions)
            .filter(p => p.assignable)
            .map(p => p.name);
    }
};
RoleService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        channel_service_1.ChannelService,
        list_query_builder_1.ListQueryBuilder,
        config_service_1.ConfigService])
], RoleService);
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map