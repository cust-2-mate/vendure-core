import { PaymentMethodQuote } from '@vendure/common/lib/generated-shop-types';
import { ConfigurableOperationDefinition, CreatePaymentMethodInput, DeletionResponse, UpdatePaymentMethodInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { PaymentMethodEligibilityChecker } from '../../config/payment/payment-method-eligibility-checker';
import { PaymentMethodHandler } from '../../config/payment/payment-method-handler';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Order } from '../../entity/order/order.entity';
import { PaymentMethod } from '../../entity/payment-method/payment-method.entity';
import { EventBus } from '../../event-bus/event-bus';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { ChannelService } from './channel.service';
/**
 * @description
 * Contains methods relating to {@link PaymentMethod} entities.
 *
 * @docsCategory services
 */
export declare class PaymentMethodService {
    private connection;
    private configService;
    private listQueryBuilder;
    private eventBus;
    private configArgService;
    private channelService;
    constructor(connection: TransactionalConnection, configService: ConfigService, listQueryBuilder: ListQueryBuilder, eventBus: EventBus, configArgService: ConfigArgService, channelService: ChannelService);
    findAll(ctx: RequestContext, options?: ListQueryOptions<PaymentMethod>): Promise<PaginatedList<PaymentMethod>>;
    findOne(ctx: RequestContext, paymentMethodId: ID): Promise<PaymentMethod | undefined>;
    create(ctx: RequestContext, input: CreatePaymentMethodInput): Promise<PaymentMethod>;
    update(ctx: RequestContext, input: UpdatePaymentMethodInput): Promise<PaymentMethod>;
    delete(ctx: RequestContext, paymentMethodId: ID, force?: boolean): Promise<DeletionResponse>;
    getPaymentMethodEligibilityCheckers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getPaymentMethodHandlers(ctx: RequestContext): ConfigurableOperationDefinition[];
    getEligiblePaymentMethods(ctx: RequestContext, order: Order): Promise<PaymentMethodQuote[]>;
    getMethodAndOperations(ctx: RequestContext, method: string): Promise<{
        paymentMethod: PaymentMethod;
        handler: PaymentMethodHandler;
        checker: PaymentMethodEligibilityChecker | null;
    }>;
}
