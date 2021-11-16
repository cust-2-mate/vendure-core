import { ConfigurableOperationDefinition, DeletionResponse, MutationCreatePaymentMethodArgs, MutationDeletePaymentMethodArgs, MutationUpdatePaymentMethodArgs, QueryPaymentMethodArgs, QueryPaymentMethodsArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { PaymentMethod } from '../../../entity/payment-method/payment-method.entity';
import { PaymentMethodService } from '../../../service/services/payment-method.service';
import { RequestContext } from '../../common/request-context';
export declare class PaymentMethodResolver {
    private paymentMethodService;
    constructor(paymentMethodService: PaymentMethodService);
    paymentMethods(ctx: RequestContext, args: QueryPaymentMethodsArgs): Promise<PaginatedList<PaymentMethod>>;
    paymentMethod(ctx: RequestContext, args: QueryPaymentMethodArgs): Promise<PaymentMethod | undefined>;
    createPaymentMethod(ctx: RequestContext, args: MutationCreatePaymentMethodArgs): Promise<PaymentMethod>;
    updatePaymentMethod(ctx: RequestContext, args: MutationUpdatePaymentMethodArgs): Promise<PaymentMethod>;
    deletePaymentMethod(ctx: RequestContext, args: MutationDeletePaymentMethodArgs): Promise<DeletionResponse>;
    paymentMethodHandlers(ctx: RequestContext): ConfigurableOperationDefinition[];
    paymentMethodEligibilityCheckers(ctx: RequestContext): ConfigurableOperationDefinition[];
}
