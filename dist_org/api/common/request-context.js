"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const utils_1 = require("../../common/utils");
const channel_entity_1 = require("../../entity/channel/channel.entity");
/**
 * @description
 * The RequestContext holds information relevant to the current request, which may be
 * required at various points of the stack.
 *
 * It is a good practice to inject the RequestContext (using the {@link Ctx} decorator) into
 * _all_ resolvers & REST handlers, and then pass it through to the service layer.
 *
 * This allows the service layer to access information about the current user, the active language,
 * the active Channel, and so on. In addition, the {@link TransactionalConnection} relies on the
 * presence of the RequestContext object in order to correctly handle per-request database transactions.
 *
 * @example
 * ```TypeScript
 * \@Query()
 * myQuery(\@Ctx() ctx: RequestContext) {
 *   return this.myService.getData(ctx);
 * }
 * ```
 * @docsCategory request
 */
class RequestContext {
    /**
     * @internal
     */
    constructor(options) {
        const { req, apiType, channel, session, languageCode, translationFn } = options;
        this._req = req;
        this._apiType = apiType;
        this._channel = channel;
        this._session = session;
        this._languageCode = languageCode || (channel && channel.defaultLanguageCode);
        this._isAuthorized = options.isAuthorized;
        this._authorizedAsOwnerOnly = options.authorizedAsOwnerOnly;
        this._translationFn = translationFn || ((key) => key);
    }
    /**
     * @description
     * Creates an "empty" RequestContext object. This is only intended to be used
     * when a service method must be called outside the normal request-response
     * cycle, e.g. when programmatically populating data.
     */
    static empty() {
        return new RequestContext({
            apiType: 'admin',
            authorizedAsOwnerOnly: false,
            channel: new channel_entity_1.Channel(),
            isAuthorized: true,
        });
    }
    /**
     * @description
     * Creates a new RequestContext object from a serialized object created by the
     * `serialize()` method.
     */
    static deserialize(ctxObject) {
        var _a;
        return new RequestContext({
            req: ctxObject._req,
            apiType: ctxObject._apiType,
            channel: new channel_entity_1.Channel(ctxObject._channel),
            session: Object.assign(Object.assign({}, ctxObject._session), { expires: ((_a = ctxObject._session) === null || _a === void 0 ? void 0 : _a.expires) && new Date(ctxObject._session.expires) }),
            languageCode: ctxObject._languageCode,
            isAuthorized: ctxObject._isAuthorized,
            authorizedAsOwnerOnly: ctxObject._authorizedAsOwnerOnly,
        });
    }
    /**
     * @description
     * Returns `true` if there is an active Session & User associated with this request,
     * and that User has the specified permissions on the active Channel.
     */
    userHasPermissions(permissions) {
        var _a;
        const user = (_a = this.session) === null || _a === void 0 ? void 0 : _a.user;
        if (!user || !this.channelId) {
            return false;
        }
        const permissionsOnChannel = user.channelPermissions.find(c => utils_1.idsAreEqual(c.id, this.channelId));
        if (permissionsOnChannel) {
            return this.arraysIntersect(permissionsOnChannel.permissions, permissions);
        }
        return false;
    }
    /**
     * @description
     * Serializes the RequestContext object into a JSON-compatible simple object.
     * This is useful when you need to send a RequestContext object to another
     * process, e.g. to pass it to the Job Queue via the {@link JobQueueService}.
     */
    serialize() {
        const serializableThis = Object.assign({}, this);
        if (this._req) {
            serializableThis._req = this.shallowCloneRequestObject(this._req);
        }
        return JSON.parse(JSON.stringify(serializableThis));
    }
    /**
     * @description
     * Creates a shallow copy of the RequestContext instance. This means that
     * mutations to the copy itself will not affect the original, but deep mutations
     * (e.g. copy.channel.code = 'new') *will* also affect the original.
     */
    copy() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
    /**
     * @description
     * The raw Express request object.
     */
    get req() {
        return this._req;
    }
    /**
     * @description
     * Signals which API this request was received by, e.g. `admin` or `shop`.
     */
    get apiType() {
        return this._apiType;
    }
    /**
     * @description
     * The active {@link Channel} of this request.
     */
    get channel() {
        return this._channel;
    }
    get channelId() {
        return this._channel.id;
    }
    get languageCode() {
        return this._languageCode;
    }
    get session() {
        return this._session;
    }
    get activeUserId() {
        var _a, _b;
        return (_b = (_a = this.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
    }
    /**
     * @description
     * True if the current session is authorized to access the current resolver method.
     *
     * @deprecated Use `userHasPermissions()` method instead.
     */
    get isAuthorized() {
        return this._isAuthorized;
    }
    /**
     * @description
     * True if the current anonymous session is only authorized to operate on entities that
     * are owned by the current session.
     */
    get authorizedAsOwnerOnly() {
        return this._authorizedAsOwnerOnly;
    }
    /**
     * @description
     * Translate the given i18n key
     */
    translate(key, variables) {
        try {
            return this._translationFn(key, variables);
        }
        catch (e) {
            return `Translation format error: ${e.message}). Original key: ${key}`;
        }
    }
    /**
     * Returns true if any element of arr1 appears in arr2.
     */
    arraysIntersect(arr1, arr2) {
        return arr1.reduce((intersects, role) => {
            return intersects || arr2.includes(role);
        }, false);
    }
    /**
     * The Express "Request" object is huge and contains many circular
     * references. We will preserve just a subset of the whole, by preserving
     * only the serializable properties up to 2 levels deep.
     * @private
     */
    shallowCloneRequestObject(req) {
        function copySimpleFieldsToDepth(target, maxDepth, depth = 0) {
            const result = {};
            // tslint:disable-next-line:forin
            for (const key in target) {
                if (key === 'host' && depth === 0) {
                    // avoid Express "deprecated: req.host" warning
                    continue;
                }
                let val;
                try {
                    val = target[key];
                }
                catch (e) {
                    val = String(e);
                }
                if (Array.isArray(val)) {
                    depth++;
                    result[key] = val.map(v => {
                        if (!shared_utils_1.isObject(v) && typeof val !== 'function') {
                            return v;
                        }
                        else {
                            return copySimpleFieldsToDepth(v, maxDepth, depth);
                        }
                    });
                    depth--;
                }
                else if (!shared_utils_1.isObject(val) && typeof val !== 'function') {
                    result[key] = val;
                }
                else if (depth < maxDepth) {
                    depth++;
                    result[key] = copySimpleFieldsToDepth(val, maxDepth, depth);
                    depth--;
                }
            }
            return result;
        }
        return copySimpleFieldsToDepth(req, 1);
    }
}
exports.RequestContext = RequestContext;
//# sourceMappingURL=request-context.js.map