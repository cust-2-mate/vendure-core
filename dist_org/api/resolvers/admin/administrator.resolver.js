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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministratorResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const administrator_service_1 = require("../../../service/services/administrator.service");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let AdministratorResolver = class AdministratorResolver {
    constructor(administratorService) {
        this.administratorService = administratorService;
    }
    administrators(ctx, args) {
        return this.administratorService.findAll(ctx, args.options || undefined);
    }
    administrator(ctx, args) {
        return this.administratorService.findOne(ctx, args.id);
    }
    async activeAdministrator(ctx) {
        if (ctx.activeUserId) {
            return this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
        }
    }
    createAdministrator(ctx, args) {
        const { input } = args;
        return this.administratorService.create(ctx, input);
    }
    updateAdministrator(ctx, args) {
        const { input } = args;
        return this.administratorService.update(ctx, input);
    }
    async updateActiveAdministrator(ctx, args) {
        if (ctx.activeUserId) {
            const { input } = args;
            const administrator = await this.administratorService.findOneByUserId(ctx, ctx.activeUserId);
            if (administrator) {
                return this.administratorService.update(ctx, Object.assign(Object.assign({}, input), { id: administrator.id }));
            }
        }
    }
    assignRoleToAdministrator(ctx, args) {
        return this.administratorService.assignRole(ctx, args.administratorId, args.roleId);
    }
    deleteAdministrator(ctx, args) {
        const { id } = args;
        return this.administratorService.softDelete(ctx, id);
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "administrators", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "administrator", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "activeAdministrator", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.CreateAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "createAdministrator", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "updateAdministrator", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.Owner),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "updateActiveAdministrator", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "assignRoleToAdministrator", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeleteAdministrator),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdministratorResolver.prototype, "deleteAdministrator", null);
AdministratorResolver = __decorate([
    graphql_1.Resolver('Administrator'),
    __metadata("design:paramtypes", [administrator_service_1.AdministratorService])
], AdministratorResolver);
exports.AdministratorResolver = AdministratorResolver;
//# sourceMappingURL=administrator.resolver.js.map