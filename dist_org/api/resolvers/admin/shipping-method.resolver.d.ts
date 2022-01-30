import { ConfigurableOperationDefinition, DeletionResponse, MutationCreateShippingMethodArgs, MutationDeleteShippingMethodArgs, MutationUpdateShippingMethodArgs, QueryShippingMethodArgs, QueryShippingMethodsArgs, QueryTestEligibleShippingMethodsArgs, QueryTestShippingMethodArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { ShippingMethod } from '../../../entity/shipping-method/shipping-method.entity';
import { OrderTestingService } from '../../../service/services/order-testing.service';
import { ShippingMethodService } from '../../../service/services/shipping-method.service';
import { RequestContext } from '../../common/request-context';
export declare class ShippingMethodResolver {
    private shippingMethodService;
    private orderTestingService;
    constructor(shippingMethodService: ShippingMethodService, orderTestingService: OrderTestingService);
    shippingMethods(ctx: RequestContext, args: QueryShippingMethodsArgs): Promise<PaginatedList<ShippingMethod>>;
    shippingMethod(ctx: RequestContext, args: QueryShippingMethodArgs): Promise<ShippingMethod | undefined>;
    shippingEligibilityCheckers(ctx: RequestContext): ConfigurableOperationDefinition[];
    shippingCalculators(ctx: RequestContext): ConfigurableOperationDefinition[];
    fulfillmentHandlers(ctx: RequestContext): ConfigurableOperationDefinition[];
    createShippingMethod(ctx: RequestContext, args: MutationCreateShippingMethodArgs): Promise<ShippingMethod>;
    updateShippingMethod(ctx: RequestContext, args: MutationUpdateShippingMethodArgs): Promise<ShippingMethod>;
    deleteShippingMethod(ctx: RequestContext, args: MutationDeleteShippingMethodArgs): Promise<DeletionResponse>;
    testShippingMethod(ctx: RequestContext, args: QueryTestShippingMethodArgs): Promise<import("@vendure/common/lib/generated-types").TestShippingMethodResult>;
    testEligibleShippingMethods(ctx: RequestContext, args: QueryTestEligibleShippingMethodsArgs): Promise<import("@vendure/common/lib/generated-types").ShippingMethodQuote[]>;
}
