import { ID } from '@vendure/common/lib/shared-types';
import { EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { RequestContext } from '../../api/common/request-context';
import { ConfigService } from '../../config/config.service';
import { CachedSession } from '../../config/session-cache/session-cache-strategy';
import { Channel } from '../../entity/channel/channel.entity';
import { Order } from '../../entity/order/order.entity';
import { AnonymousSession } from '../../entity/session/anonymous-session.entity';
import { AuthenticatedSession } from '../../entity/session/authenticated-session.entity';
import { User } from '../../entity/user/user.entity';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { OrderService } from './order.service';
export declare class SessionService implements EntitySubscriberInterface {
    private connection;
    private configService;
    private orderService;
    private sessionCacheStrategy;
    private readonly sessionDurationInMs;
    constructor(connection: TransactionalConnection, configService: ConfigService, orderService: OrderService);
    afterInsert(event: InsertEvent<any>): Promise<any> | void;
    afterRemove(event: RemoveEvent<any>): Promise<any> | void;
    afterUpdate(event: UpdateEvent<any>): Promise<any> | void;
    private clearSessionCacheOnDataChange;
    createNewAuthenticatedSession(ctx: RequestContext, user: User, authenticationStrategyName: string): Promise<AuthenticatedSession>;
    /**
     * Create an anonymous session.
     */
    createAnonymousSession(): Promise<CachedSession>;
    getSessionFromToken(sessionToken: string): Promise<CachedSession | undefined>;
    serializeSession(session: AuthenticatedSession | AnonymousSession): CachedSession;
    /**
     * Looks for a valid session with the given token and returns one if found.
     */
    private findSessionByToken;
    setActiveOrder(ctx: RequestContext, serializedSession: CachedSession, order: Order): Promise<CachedSession>;
    unsetActiveOrder(ctx: RequestContext, serializedSession: CachedSession): Promise<CachedSession>;
    setActiveChannel(serializedSession: CachedSession, channel: Channel): Promise<CachedSession>;
    /**
     * Deletes all existing sessions for the given user.
     */
    deleteSessionsByUser(ctx: RequestContext, user: User): Promise<void>;
    /**
     * Deletes all existing sessions with the given activeOrder.
     */
    deleteSessionsByActiveOrderId(ctx: RequestContext, activeOrderId: ID): Promise<void>;
    /**
     * If we are over half way to the current session's expiry date, then we update it.
     *
     * This ensures that the session will not expire when in active use, but prevents us from
     * needing to run an update query on *every* request.
     */
    private updateSessionExpiry;
    /**
     * Returns a future expiry date according timeToExpireInMs in the future.
     */
    private getExpiryDate;
    /**
     * Generates a random session token.
     */
    private generateSessionToken;
    private isAuthenticatedSession;
}
