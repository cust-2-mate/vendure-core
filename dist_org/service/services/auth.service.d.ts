import { ID } from '@vendure/common/lib/shared-types';
import { ApiType } from '../../api/common/get-api-type';
import { RequestContext } from '../../api/common/request-context';
import { InvalidCredentialsError } from '../../common/error/generated-graphql-admin-errors';
import { InvalidCredentialsError as ShopInvalidCredentialsError, NotVerifiedError } from '../../common/error/generated-graphql-shop-errors';
import { ConfigService } from '../../config/config.service';
import { AuthenticatedSession } from '../../entity/session/authenticated-session.entity';
import { User } from '../../entity/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { SessionService } from './session.service';
/**
 * The AuthService manages both authenticated and anonymous Sessions.
 */
export declare class AuthService {
    private connection;
    private configService;
    private sessionService;
    private eventBus;
    constructor(connection: TransactionalConnection, configService: ConfigService, sessionService: SessionService, eventBus: EventBus);
    /**
     * Authenticates a user's credentials and if okay, creates a new session.
     */
    authenticate(ctx: RequestContext, apiType: ApiType, authenticationMethod: string, authenticationData: any): Promise<AuthenticatedSession | InvalidCredentialsError | NotVerifiedError>;
    createAuthenticatedSessionForUser(ctx: RequestContext, user: User, authenticationStrategyName: string): Promise<AuthenticatedSession | NotVerifiedError>;
    /**
     * Verify the provided password against the one we have for the given user.
     */
    verifyUserPassword(ctx: RequestContext, userId: ID, password: string): Promise<boolean | InvalidCredentialsError | ShopInvalidCredentialsError>;
    /**
     * Deletes all sessions for the user associated with the given session token.
     */
    destroyAuthenticatedSession(ctx: RequestContext, sessionToken: string): Promise<void>;
    private getAuthenticationStrategy;
}
