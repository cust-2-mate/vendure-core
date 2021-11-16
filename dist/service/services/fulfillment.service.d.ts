import { ConfigurableOperationInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { CreateFulfillmentError, FulfillmentStateTransitionError, InvalidFulfillmentHandlerError } from '../../common/error/generated-graphql-admin-errors';
import { ConfigService } from '../../config/config.service';
import { Fulfillment } from '../../entity/fulfillment/fulfillment.entity';
import { OrderItem } from '../../entity/order-item/order-item.entity';
import { Order } from '../../entity/order/order.entity';
import { EventBus } from '../../event-bus/event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { FulfillmentState } from '../helpers/fulfillment-state-machine/fulfillment-state';
import { FulfillmentStateMachine } from '../helpers/fulfillment-state-machine/fulfillment-state-machine';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class FulfillmentService {
    private connection;
    private fulfillmentStateMachine;
    private eventBus;
    private configService;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, fulfillmentStateMachine: FulfillmentStateMachine, eventBus: EventBus, configService: ConfigService, customFieldRelationService: CustomFieldRelationService);
    create(ctx: RequestContext, orders: Order[], items: OrderItem[], handler: ConfigurableOperationInput): Promise<Fulfillment | InvalidFulfillmentHandlerError | CreateFulfillmentError>;
    findOneOrThrow(ctx: RequestContext, id: ID, relations?: string[]): Promise<Fulfillment>;
    getOrderItemsByFulfillmentId(ctx: RequestContext, id: ID): Promise<OrderItem[]>;
    transitionToState(ctx: RequestContext, fulfillmentId: ID, state: FulfillmentState): Promise<{
        fulfillment: Fulfillment;
        orders: Order[];
        fromState: FulfillmentState;
        toState: FulfillmentState;
    } | FulfillmentStateTransitionError>;
    getNextStates(fulfillment: Fulfillment): ReadonlyArray<FulfillmentState>;
}
