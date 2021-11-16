import { RegisterCustomerAccountResult, RegisterCustomerInput, UpdateCustomerInput as UpdateCustomerShopInput, VerifyCustomerAccountResult } from '@vendure/common/lib/generated-shop-types';
import { AddNoteToCustomerInput, CreateAddressInput, CreateCustomerInput, CreateCustomerResult, DeletionResponse, UpdateAddressInput, UpdateCustomerInput, UpdateCustomerNoteInput, UpdateCustomerResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion } from '../../common/error/error-result';
import { EmailAddressConflictError, IdentifierChangeTokenExpiredError, IdentifierChangeTokenInvalidError, PasswordResetTokenExpiredError, PasswordResetTokenInvalidError } from '../../common/error/generated-graphql-shop-errors';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { Address } from '../../entity/address/address.entity';
import { CustomerGroup } from '../../entity/customer-group/customer-group.entity';
import { Customer } from '../../entity/customer/customer.entity';
import { HistoryEntry } from '../../entity/history-entry/history-entry.entity';
import { User } from '../../entity/user/user.entity';
import { EventBus } from '../../event-bus/event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
import { CountryService } from './country.service';
import { HistoryService } from './history.service';
import { UserService } from './user.service';
export declare class CustomerService {
    private connection;
    private configService;
    private userService;
    private countryService;
    private listQueryBuilder;
    private eventBus;
    private historyService;
    private channelService;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, configService: ConfigService, userService: UserService, countryService: CountryService, listQueryBuilder: ListQueryBuilder, eventBus: EventBus, historyService: HistoryService, channelService: ChannelService, customFieldRelationService: CustomFieldRelationService);
    findAll(ctx: RequestContext, options: ListQueryOptions<Customer> | undefined): Promise<PaginatedList<Customer>>;
    findOne(ctx: RequestContext, id: ID): Promise<Customer | undefined>;
    findOneByUserId(ctx: RequestContext, userId: ID, filterOnChannel?: boolean): Promise<Customer | undefined>;
    findAddressesByCustomerId(ctx: RequestContext, customerId: ID): Promise<Address[]>;
    getCustomerGroups(ctx: RequestContext, customerId: ID): Promise<CustomerGroup[]>;
    create(ctx: RequestContext, input: CreateCustomerInput, password?: string): Promise<ErrorResultUnion<CreateCustomerResult, Customer>>;
    update(ctx: RequestContext, input: UpdateCustomerShopInput & {
        id: ID;
    }): Promise<Customer>;
    update(ctx: RequestContext, input: UpdateCustomerInput): Promise<ErrorResultUnion<UpdateCustomerResult, Customer>>;
    registerCustomerAccount(ctx: RequestContext, input: RegisterCustomerInput): Promise<RegisterCustomerAccountResult | EmailAddressConflictError>;
    refreshVerificationToken(ctx: RequestContext, emailAddress: string): Promise<void>;
    verifyCustomerEmailAddress(ctx: RequestContext, verificationToken: string, password?: string): Promise<ErrorResultUnion<VerifyCustomerAccountResult, Customer>>;
    requestPasswordReset(ctx: RequestContext, emailAddress: string): Promise<void>;
    resetPassword(ctx: RequestContext, passwordResetToken: string, password: string): Promise<User | PasswordResetTokenExpiredError | PasswordResetTokenInvalidError>;
    requestUpdateEmailAddress(ctx: RequestContext, userId: ID, newEmailAddress: string): Promise<boolean | EmailAddressConflictError>;
    updateEmailAddress(ctx: RequestContext, token: string): Promise<boolean | IdentifierChangeTokenInvalidError | IdentifierChangeTokenExpiredError>;
    /**
     * For guest checkouts, we assume that a matching email address is the same customer.
     */
    createOrUpdate(ctx: RequestContext, input: Partial<CreateCustomerInput> & {
        emailAddress: string;
    }, errorOnExistingUser?: boolean): Promise<Customer | EmailAddressConflictError>;
    createAddress(ctx: RequestContext, customerId: ID, input: CreateAddressInput): Promise<Address>;
    updateAddress(ctx: RequestContext, input: UpdateAddressInput): Promise<Address>;
    deleteAddress(ctx: RequestContext, id: ID): Promise<boolean>;
    softDelete(ctx: RequestContext, customerId: ID): Promise<DeletionResponse>;
    addNoteToCustomer(ctx: RequestContext, input: AddNoteToCustomerInput): Promise<Customer>;
    updateCustomerNote(ctx: RequestContext, input: UpdateCustomerNoteInput): Promise<HistoryEntry>;
    deleteCustomerNote(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    private enforceSingleDefaultAddress;
    /**
     * If a Customer Address is to be deleted, check if it is assigned as a default for shipping or
     * billing. If so, attempt to transfer default status to one of the other addresses if there are
     * any.
     */
    private reassignDefaultsForDeletedAddress;
}
