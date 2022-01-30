import { ApplyCouponCodeResult } from '@vendure/common/lib/generated-shop-types';
import { AssignPromotionsToChannelInput, ConfigurableOperationDefinition, CreatePromotionInput, CreatePromotionResult, DeletionResponse, RemovePromotionsFromChannelInput, UpdatePromotionInput, UpdatePromotionResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion, JustErrorResults } from '../../common/error/error-result';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { PromotionAction } from '../../config/promotion/promotion-action';
import { PromotionCondition } from '../../config/promotion/promotion-condition';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Order } from '../../entity/order/order.entity';
import { Promotion } from '../../entity/promotion/promotion.entity';
import { EventBus } from '../../event-bus';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { ChannelService } from './channel.service';
/**
 * @description
 * Contains methods relating to {@link Promotion} entities.
 *
 * @docsCategory services
 */
export declare class PromotionService {
    private connection;
    private configService;
    private channelService;
    private listQueryBuilder;
    private configArgService;
    private eventBus;
    availableConditions: PromotionCondition[];
    availableActions: PromotionAction[];
    constructor(connection: TransactionalConnection, configService: ConfigService, channelService: ChannelService, listQueryBuilder: ListQueryBuilder, configArgService: ConfigArgService, eventBus: EventBus);
    findAll(ctx: RequestContext, options?: ListQueryOptions<Promotion>): Promise<PaginatedList<Promotion>>;
    findOne(ctx: RequestContext, adjustmentSourceId: ID): Promise<Promotion | undefined>;
    getPromotionConditions(ctx: RequestContext): ConfigurableOperationDefinition[];
    getPromotionActions(ctx: RequestContext): ConfigurableOperationDefinition[];
    createPromotion(ctx: RequestContext, input: CreatePromotionInput): Promise<ErrorResultUnion<CreatePromotionResult, Promotion>>;
    updatePromotion(ctx: RequestContext, input: UpdatePromotionInput): Promise<ErrorResultUnion<UpdatePromotionResult, Promotion>>;
    softDeletePromotion(ctx: RequestContext, promotionId: ID): Promise<DeletionResponse>;
    assignPromotionsToChannel(ctx: RequestContext, input: AssignPromotionsToChannelInput): Promise<Promotion[]>;
    removePromotionsFromChannel(ctx: RequestContext, input: RemovePromotionsFromChannelInput): Promise<Promotion[]>;
    /**
     * @description
     * Checks the validity of a coupon code, by checking that it is associated with an existing,
     * enabled and non-expired Promotion. Additionally, if there is a usage limit on the coupon code,
     * this method will enforce that limit against the specified Customer.
     */
    validateCouponCode(ctx: RequestContext, couponCode: string, customerId?: ID): Promise<JustErrorResults<ApplyCouponCodeResult> | Promotion>;
    /**
     * @description
     * Used internally to associate a Promotion with an Order, once an Order has been placed.
     */
    addPromotionsToOrder(ctx: RequestContext, order: Order): Promise<Order>;
    private countPromotionUsagesForCustomer;
    private calculatePriorityScore;
    private validateRequiredConditions;
}
