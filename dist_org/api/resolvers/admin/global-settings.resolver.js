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
exports.GlobalSettingsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const graphql_2 = require("graphql");
const constants_1 = require("../../../common/constants");
const generated_graphql_admin_errors_1 = require("../../../common/error/generated-graphql-admin-errors");
const config_service_1 = require("../../../config/config.service");
const channel_service_1 = require("../../../service/services/channel.service");
const global_settings_service_1 = require("../../../service/services/global-settings.service");
const order_service_1 = require("../../../service/services/order.service");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let GlobalSettingsResolver = class GlobalSettingsResolver {
    constructor(configService, globalSettingsService, channelService, orderService) {
        this.configService = configService;
        this.globalSettingsService = globalSettingsService;
        this.channelService = channelService;
        this.orderService = orderService;
    }
    async globalSettings(ctx) {
        return this.globalSettingsService.getSettings(ctx);
    }
    /**
     * Exposes a subset of the VendureConfig which may be of use to clients.
     */
    serverConfig(info) {
        const permissions = constants_1.getAllPermissionsMetadata(this.configService.authOptions.customPermissions).filter(p => !p.internal);
        return {
            customFieldConfig: this.generateCustomFieldConfig(info),
            orderProcess: this.orderService.getOrderProcessStates(),
            permittedAssetTypes: this.configService.assetOptions.permittedFileTypes,
            permissions,
        };
    }
    async updateGlobalSettings(ctx, args) {
        // This validation is performed here in the resolver rather than at the service
        // layer to avoid a circular dependency [ChannelService <> GlobalSettingsService]
        const { availableLanguages } = args.input;
        if (availableLanguages) {
            const channels = await this.channelService.findAll(ctx);
            const unavailableDefaults = channels.filter(c => !availableLanguages.includes(c.defaultLanguageCode));
            if (unavailableDefaults.length) {
                return new generated_graphql_admin_errors_1.ChannelDefaultLanguageError(unavailableDefaults.map(c => c.defaultLanguageCode).join(', '), unavailableDefaults.map(c => c.code).join(', '));
            }
        }
        return this.globalSettingsService.updateSettings(ctx, args.input);
    }
    generateCustomFieldConfig(info) {
        const exposedCustomFieldConfig = {};
        for (const [entityType, customFields] of Object.entries(this.configService.customFields)) {
            exposedCustomFieldConfig[entityType] = customFields
                // Do not expose custom fields marked as "internal".
                .filter(c => !c.internal)
                .map(c => (Object.assign(Object.assign({}, c), { list: !!c.list })))
                .map((c) => {
                // In the VendureConfig, the relation entity is specified
                // as the class, but the GraphQL API exposes it as a string.
                if (c.type === 'relation') {
                    c.entity = c.entity.name;
                    c.scalarFields = this.getScalarFieldsOfType(info, c.graphQLType || c.entity);
                }
                return c;
            });
        }
        return exposedCustomFieldConfig;
    }
    getScalarFieldsOfType(info, typeName) {
        const type = info.schema.getType(typeName);
        if (type && graphql_2.isObjectType(type)) {
            return Object.values(type.getFields())
                .filter(field => {
                const namedType = this.getNamedType(field.type);
                return graphql_2.isScalarType(namedType) || graphql_2.isEnumType(namedType);
            })
                .map(field => field.name);
        }
        else {
            return [];
        }
    }
    getNamedType(type) {
        if (graphql_2.isNonNullType(type) || graphql_2.isListType(type)) {
            return this.getNamedType(type.ofType);
        }
        else {
            return type;
        }
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.Authenticated),
    __param(0, request_context_decorator_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext]),
    __metadata("design:returntype", Promise)
], GlobalSettingsResolver.prototype, "globalSettings", null);
__decorate([
    graphql_1.ResolveField(),
    __param(0, graphql_1.Info()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], GlobalSettingsResolver.prototype, "serverConfig", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateSettings, generated_types_1.Permission.UpdateGlobalSettings),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], GlobalSettingsResolver.prototype, "updateGlobalSettings", null);
GlobalSettingsResolver = __decorate([
    graphql_1.Resolver('GlobalSettings'),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        global_settings_service_1.GlobalSettingsService,
        channel_service_1.ChannelService,
        order_service_1.OrderService])
], GlobalSettingsResolver);
exports.GlobalSettingsResolver = GlobalSettingsResolver;
//# sourceMappingURL=global-settings.resolver.js.map