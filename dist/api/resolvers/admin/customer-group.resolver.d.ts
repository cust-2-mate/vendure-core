import { DeletionResponse, MutationAddCustomersToGroupArgs, MutationCreateCustomerGroupArgs, MutationDeleteCustomerGroupArgs, MutationRemoveCustomersFromGroupArgs, MutationUpdateCustomerGroupArgs, QueryCustomerGroupArgs, QueryCustomerGroupsArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { CustomerGroup } from '../../../entity/customer-group/customer-group.entity';
import { CustomerGroupService } from '../../../service/services/customer-group.service';
import { RequestContext } from '../../common/request-context';
export declare class CustomerGroupResolver {
    private customerGroupService;
    constructor(customerGroupService: CustomerGroupService);
    customerGroups(ctx: RequestContext, args: QueryCustomerGroupsArgs): Promise<PaginatedList<CustomerGroup>>;
    customerGroup(ctx: RequestContext, args: QueryCustomerGroupArgs): Promise<CustomerGroup | undefined>;
    createCustomerGroup(ctx: RequestContext, args: MutationCreateCustomerGroupArgs): Promise<CustomerGroup>;
    updateCustomerGroup(ctx: RequestContext, args: MutationUpdateCustomerGroupArgs): Promise<CustomerGroup>;
    deleteCustomerGroup(ctx: RequestContext, args: MutationDeleteCustomerGroupArgs): Promise<DeletionResponse>;
    addCustomersToGroup(ctx: RequestContext, args: MutationAddCustomersToGroupArgs): Promise<CustomerGroup>;
    removeCustomersFromGroup(ctx: RequestContext, args: MutationRemoveCustomersFromGroupArgs): Promise<CustomerGroup>;
}
