import { VerifyCustomerAccountResult } from '@vendure/common/lib/generated-shop-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion } from '../../common/error/error-result';
import { IdentifierChangeTokenExpiredError, IdentifierChangeTokenInvalidError, InvalidCredentialsError, PasswordResetTokenExpiredError, PasswordResetTokenInvalidError } from '../../common/error/generated-graphql-shop-errors';
import { ConfigService } from '../../config/config.service';
import { User } from '../../entity/user/user.entity';
import { PasswordCipher } from '../helpers/password-cipher/password-cipher';
import { VerificationTokenGenerator } from '../helpers/verification-token-generator/verification-token-generator';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { RoleService } from './role.service';
export declare class UserService {
    private connection;
    private configService;
    private roleService;
    private passwordCipher;
    private verificationTokenGenerator;
    constructor(connection: TransactionalConnection, configService: ConfigService, roleService: RoleService, passwordCipher: PasswordCipher, verificationTokenGenerator: VerificationTokenGenerator);
    getUserById(ctx: RequestContext, userId: ID): Promise<User | undefined>;
    getUserByEmailAddress(ctx: RequestContext, emailAddress: string): Promise<User | undefined>;
    createCustomerUser(ctx: RequestContext, identifier: string, password?: string): Promise<User>;
    addNativeAuthenticationMethod(ctx: RequestContext, user: User, identifier: string, password?: string): Promise<User>;
    createAdminUser(ctx: RequestContext, identifier: string, password: string): Promise<User>;
    softDelete(ctx: RequestContext, userId: ID): Promise<void>;
    setVerificationToken(ctx: RequestContext, user: User): Promise<User>;
    verifyUserByToken(ctx: RequestContext, verificationToken: string, password?: string): Promise<ErrorResultUnion<VerifyCustomerAccountResult, User>>;
    setPasswordResetToken(ctx: RequestContext, emailAddress: string): Promise<User | undefined>;
    resetPasswordByToken(ctx: RequestContext, passwordResetToken: string, password: string): Promise<User | PasswordResetTokenExpiredError | PasswordResetTokenInvalidError>;
    /**
     * Changes the User identifier without an email verification step, so this should be only used when
     * an Administrator is setting a new email address.
     */
    changeNativeIdentifier(ctx: RequestContext, userId: ID, newIdentifier: string): Promise<void>;
    /**
     * Changes the User identifier as part of the storefront flow used by Customers to set a
     * new email address.
     */
    changeIdentifierByToken(ctx: RequestContext, token: string): Promise<{
        user: User;
        oldIdentifier: string;
    } | IdentifierChangeTokenInvalidError | IdentifierChangeTokenExpiredError>;
    updatePassword(ctx: RequestContext, userId: ID, currentPassword: string, newPassword: string): Promise<boolean | InvalidCredentialsError>;
    setIdentifierChangeToken(ctx: RequestContext, user: User): Promise<User>;
}
