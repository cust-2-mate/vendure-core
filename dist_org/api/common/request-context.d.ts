import { LanguageCode, Permission } from '@vendure/common/lib/generated-types';
import { ID, JsonCompatible } from '@vendure/common/lib/shared-types';
import { Request } from 'express';
import { TFunction } from 'i18next';
import { CachedSession } from '../../config/session-cache/session-cache-strategy';
import { Channel } from '../../entity/channel/channel.entity';
import { ApiType } from './get-api-type';
export declare type SerializedRequestContext = {
    _req?: any;
    _session: JsonCompatible<Required<CachedSession>>;
    _apiType: ApiType;
    _channel: JsonCompatible<Channel>;
    _languageCode: LanguageCode;
    _isAuthorized: boolean;
    _authorizedAsOwnerOnly: boolean;
};
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
export declare class RequestContext {
    private readonly _languageCode;
    private readonly _channel;
    private readonly _session?;
    private readonly _isAuthorized;
    private readonly _authorizedAsOwnerOnly;
    private readonly _translationFn;
    private readonly _apiType;
    private readonly _req?;
    /**
     * @internal
     */
    constructor(options: {
        req?: Request;
        apiType: ApiType;
        channel: Channel;
        session?: CachedSession;
        languageCode?: LanguageCode;
        isAuthorized: boolean;
        authorizedAsOwnerOnly: boolean;
        translationFn?: TFunction;
    });
    /**
     * @description
     * Creates an "empty" RequestContext object. This is only intended to be used
     * when a service method must be called outside the normal request-response
     * cycle, e.g. when programmatically populating data.
     */
    static empty(): RequestContext;
    /**
     * @description
     * Creates a new RequestContext object from a serialized object created by the
     * `serialize()` method.
     */
    static deserialize(ctxObject: SerializedRequestContext): RequestContext;
    /**
     * @description
     * Returns `true` if there is an active Session & User associated with this request,
     * and that User has the specified permissions on the active Channel.
     */
    userHasPermissions(permissions: Permission[]): boolean;
    /**
     * @description
     * Serializes the RequestContext object into a JSON-compatible simple object.
     * This is useful when you need to send a RequestContext object to another
     * process, e.g. to pass it to the Job Queue via the {@link JobQueueService}.
     */
    serialize(): SerializedRequestContext;
    /**
     * @description
     * Creates a shallow copy of the RequestContext instance. This means that
     * mutations to the copy itself will not affect the original, but deep mutations
     * (e.g. copy.channel.code = 'new') *will* also affect the original.
     */
    copy(): RequestContext;
    /**
     * @description
     * The raw Express request object.
     */
    get req(): Request | undefined;
    /**
     * @description
     * Signals which API this request was received by, e.g. `admin` or `shop`.
     */
    get apiType(): ApiType;
    /**
     * @description
     * The active {@link Channel} of this request.
     */
    get channel(): Channel;
    get channelId(): ID;
    get languageCode(): LanguageCode;
    get session(): CachedSession | undefined;
    get activeUserId(): ID | undefined;
    /**
     * @description
     * True if the current session is authorized to access the current resolver method.
     *
     * @deprecated Use `userHasPermissions()` method instead.
     */
    get isAuthorized(): boolean;
    /**
     * @description
     * True if the current anonymous session is only authorized to operate on entities that
     * are owned by the current session.
     */
    get authorizedAsOwnerOnly(): boolean;
    /**
     * @description
     * Translate the given i18n key
     */
    translate(key: string, variables?: {
        [k: string]: any;
    }): string;
    /**
     * Returns true if any element of arr1 appears in arr2.
     */
    private arraysIntersect;
    /**
     * The Express "Request" object is huge and contains many circular
     * references. We will preserve just a subset of the whole, by preserving
     * only the serializable properties up to 2 levels deep.
     * @private
     */
    private shallowCloneRequestObject;
}
