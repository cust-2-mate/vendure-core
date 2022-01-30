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
exports.AdministratorService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const request_context_1 = require("../../api/common/request-context");
const errors_1 = require("../../common/error/errors");
const config_1 = require("../../config");
const administrator_entity_1 = require("../../entity/administrator/administrator.entity");
const native_authentication_method_entity_1 = require("../../entity/authentication-method/native-authentication-method.entity");
const user_entity_1 = require("../../entity/user/user.entity");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const list_query_builder_1 = require("../helpers/list-query-builder/list-query-builder");
const password_cipher_1 = require("../helpers/password-cipher/password-cipher");
const patch_entity_1 = require("../helpers/utils/patch-entity");
const transactional_connection_1 = require("../transaction/transactional-connection");
const role_service_1 = require("./role.service");
const user_service_1 = require("./user.service");
let AdministratorService = class AdministratorService {
    constructor(connection, configService, listQueryBuilder, passwordCipher, userService, roleService, customFieldRelationService) {
        this.connection = connection;
        this.configService = configService;
        this.listQueryBuilder = listQueryBuilder;
        this.passwordCipher = passwordCipher;
        this.userService = userService;
        this.roleService = roleService;
        this.customFieldRelationService = customFieldRelationService;
    }
    async initAdministrators() {
        await this.ensureSuperAdminExists();
    }
    findAll(ctx, options) {
        return this.listQueryBuilder
            .build(administrator_entity_1.Administrator, options, {
            relations: ['user', 'user.roles'],
            where: { deletedAt: null },
            ctx,
        })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
            items,
            totalItems,
        }));
    }
    findOne(ctx, administratorId) {
        return this.connection.getRepository(ctx, administrator_entity_1.Administrator).findOne(administratorId, {
            relations: ['user', 'user.roles'],
            where: {
                deletedAt: null,
            },
        });
    }
    findOneByUserId(ctx, userId) {
        return this.connection.getRepository(ctx, administrator_entity_1.Administrator).findOne({
            where: {
                user: { id: userId },
                deletedAt: null,
            },
        });
    }
    async create(ctx, input) {
        const administrator = new administrator_entity_1.Administrator(input);
        administrator.user = await this.userService.createAdminUser(ctx, input.emailAddress, input.password);
        let createdAdministrator = await this.connection
            .getRepository(ctx, administrator_entity_1.Administrator)
            .save(administrator);
        for (const roleId of input.roleIds) {
            createdAdministrator = await this.assignRole(ctx, createdAdministrator.id, roleId);
        }
        await this.customFieldRelationService.updateRelations(ctx, administrator_entity_1.Administrator, input, createdAdministrator);
        return createdAdministrator;
    }
    async update(ctx, input) {
        const administrator = await this.findOne(ctx, input.id);
        if (!administrator) {
            throw new errors_1.EntityNotFoundError('Administrator', input.id);
        }
        let updatedAdministrator = patch_entity_1.patchEntity(administrator, input);
        await this.connection.getRepository(ctx, administrator_entity_1.Administrator).save(administrator, { reload: false });
        if (input.emailAddress) {
            updatedAdministrator.user.identifier = input.emailAddress;
            await this.connection.getRepository(ctx, user_entity_1.User).save(updatedAdministrator.user);
        }
        if (input.password) {
            const user = await this.userService.getUserById(ctx, administrator.user.id);
            if (user) {
                const nativeAuthMethod = user.getNativeAuthenticationMethod();
                nativeAuthMethod.passwordHash = await this.passwordCipher.hash(input.password);
                await this.connection.getRepository(ctx, native_authentication_method_entity_1.NativeAuthenticationMethod).save(nativeAuthMethod);
            }
        }
        if (input.roleIds) {
            administrator.user.roles = [];
            await this.connection.getRepository(ctx, user_entity_1.User).save(administrator.user, { reload: false });
            for (const roleId of input.roleIds) {
                updatedAdministrator = await this.assignRole(ctx, administrator.id, roleId);
            }
        }
        await this.customFieldRelationService.updateRelations(ctx, administrator_entity_1.Administrator, input, updatedAdministrator);
        return updatedAdministrator;
    }
    /**
     * Assigns a Role to the Administrator's User entity.
     */
    async assignRole(ctx, administratorId, roleId) {
        const administrator = await this.findOne(ctx, administratorId);
        if (!administrator) {
            throw new errors_1.EntityNotFoundError('Administrator', administratorId);
        }
        const role = await this.roleService.findOne(ctx, roleId);
        if (!role) {
            throw new errors_1.EntityNotFoundError('Role', roleId);
        }
        administrator.user.roles.push(role);
        await this.connection.getRepository(ctx, user_entity_1.User).save(administrator.user, { reload: false });
        return administrator;
    }
    async softDelete(ctx, id) {
        const administrator = await this.connection.getEntityOrThrow(ctx, administrator_entity_1.Administrator, id, {
            relations: ['user'],
        });
        await this.connection.getRepository(ctx, administrator_entity_1.Administrator).update({ id }, { deletedAt: new Date() });
        // tslint:disable-next-line:no-non-null-assertion
        await this.userService.softDelete(ctx, administrator.user.id);
        return {
            result: generated_types_1.DeletionResult.DELETED,
        };
    }
    /**
     * There must always exist a SuperAdmin, otherwise full administration via API will
     * no longer be possible.
     */
    async ensureSuperAdminExists() {
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.getRepository(user_entity_1.User).findOne({
            where: {
                identifier: superadminCredentials.identifier,
            },
        });
        if (!superAdminUser) {
            const superAdminRole = await this.roleService.getSuperAdminRole();
            const administrator = await this.create(request_context_1.RequestContext.empty(), {
                emailAddress: superadminCredentials.identifier,
                password: superadminCredentials.password,
                firstName: 'Super',
                lastName: 'Admin',
                roleIds: [superAdminRole.id],
            });
        }
    }
};
AdministratorService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        config_1.ConfigService,
        list_query_builder_1.ListQueryBuilder,
        password_cipher_1.PasswordCipher,
        user_service_1.UserService,
        role_service_1.RoleService,
        custom_field_relation_service_1.CustomFieldRelationService])
], AdministratorService);
exports.AdministratorService = AdministratorService;
//# sourceMappingURL=administrator.service.js.map