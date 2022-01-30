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
exports.RequestContextService = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const utils_1 = require("../../common/utils");
const config_service_1 = require("../../config/config.service");
const channel_service_1 = require("../../service/services/channel.service");
const get_api_type_1 = require("./get-api-type");
const request_context_1 = require("./request-context");
/**
 * Creates new RequestContext instances.
 */
let RequestContextService = class RequestContextService {
    constructor(channelService, configService) {
        this.channelService = channelService;
        this.configService = configService;
    }
    /**
     * Creates a new RequestContext based on an Express request object.
     */
    async fromRequest(req, info, requiredPermissions, session) {
        const channelToken = this.getChannelToken(req);
        const channel = this.channelService.getChannelFromToken(channelToken);
        const apiType = get_api_type_1.getApiType(info);
        const hasOwnerPermission = !!requiredPermissions && requiredPermissions.includes(generated_types_1.Permission.Owner);
        const languageCode = this.getLanguageCode(req, channel);
        const user = session && session.user;
        const isAuthorized = this.userHasRequiredPermissionsOnChannel(requiredPermissions, channel, user);
        const authorizedAsOwnerOnly = !isAuthorized && hasOwnerPermission;
        const translationFn = req.t;
        return new request_context_1.RequestContext({
            req,
            apiType,
            channel,
            languageCode,
            session,
            isAuthorized,
            authorizedAsOwnerOnly,
            translationFn,
        });
    }
    getChannelToken(req) {
        const tokenKey = this.configService.apiOptions.channelTokenKey;
        let channelToken = '';
        if (req && req.query && req.query[tokenKey]) {
            channelToken = req.query[tokenKey];
        }
        else if (req && req.headers && req.headers[tokenKey]) {
            channelToken = req.headers[tokenKey];
        }
        return channelToken;
    }
    getLanguageCode(req, channel) {
        var _a, _b;
        return ((_b = (_a = (req.query && req.query.languageCode)) !== null && _a !== void 0 ? _a : channel.defaultLanguageCode) !== null && _b !== void 0 ? _b : this.configService.defaultLanguageCode);
    }
    /**
     * TODO: Deprecate and remove, since this function is now handled internally in the RequestContext.
     * @private
     */
    userHasRequiredPermissionsOnChannel(permissions = [], channel, user) {
        if (!user || !channel) {
            return false;
        }
        const permissionsOnChannel = user.channelPermissions.find(c => utils_1.idsAreEqual(c.id, channel.id));
        if (permissionsOnChannel) {
            return this.arraysIntersect(permissionsOnChannel.permissions, permissions);
        }
        return false;
    }
    /**
     * Returns true if any element of arr1 appears in arr2.
     */
    arraysIntersect(arr1, arr2) {
        return arr1.reduce((intersects, role) => {
            return intersects || arr2.includes(role);
        }, false);
    }
};
RequestContextService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [channel_service_1.ChannelService, config_service_1.ConfigService])
], RequestContextService);
exports.RequestContextService = RequestContextService;
//# sourceMappingURL=request-context.service.js.map