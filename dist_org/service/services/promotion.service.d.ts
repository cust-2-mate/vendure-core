import { ApplyCouponCodeResult } from '@vendure/common/lib/generated-shop-types';
import { AssignPromotionsToChannelInput, ConfigurableOperationDefinition, CreatePromotionInput, CreatePromotionResult, DeletionResponse, RemovePromotionsFromChannelInput, UpdatePromotionInput, UpdatePromotionResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ErrorResultUnion, JustErrorResults } from '../../common/error/error-result';
import { ListQueryOptions } from '../../common/types/common-types';
import { ConfigService } from '../../config/config.service';
import { PromotionAction } from '../../config/promotion/promotion-action';
import { PromotionCondition } from '../../config/promotion/promotion-condition';
import { Order } from '../../entity/order/order.entity';
import { Promotion } from '../../entity/promotion/promotion.entity';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
export declare class PromotionService {
    private connection;
    private configService;
    private channelService;
    private listQueryBuilder;
    private configArgService;
    availableConditions: PromotionCondition[];
    availableActions: PromotionAction[];
    /**
     * All active AdjustmentSources are cached in memory becuase they are needed
     * every time an order is changed, which will happen often. Caching them means
     * a DB call is not required newly each time.
     */
    private activePromotions;
    constructor(connection: TransactionalConnection, configService: ConfigService, channelService: ChannelService, listQueryBuilder: ListQueryBuilder, configArgService: ConfigArgService);
    findAll(ctx: RequestContext, options?: ListQueryOptions<Promotion>): Promise<PaginatedList<Promotion>>;
    findOne(ctx: RequestContext, adjustmentSourceId: ID): Promise<Promotion | undefined>;
    getPromotionConditions(ctx: RequestContext): ConfigurableOperationDefinition[];
    getPromotionActions(ctx: RequestContext): ConfigurableOperationDefinition[];
    /**
     * Returns all active AdjustmentSources.
     */
    getActivePromotions(): Promise<Promotion[]>;
    createPromotion(ctx: RequestContext, input: CreatePromotionInput): Promise<ErrorResultUnion<CreatePromotionResult, Promotion>>;
    updatePromotion(ctx: RequestContext, input: UpdatePromotionInput): Promise<ErrorResultUnion<UpdatePromotionResult, Promotion>>;
    softDeletePromotion(ctx: RequestContext, promotionId: ID): Promise<DeletionResponse>;
    assignPromotionsToChannel(ctx: RequestContext, input: AssignPromotionsToChannelInput): Promise<Promotion[]>;
    removePromotionsFromChannel(ctx: RequestContext, input: RemovePromotionsFromChannelInput): Promise<Promotion[]>;
    validateCouponCode(ctx: RequestContext, couponCode: string, customerId?: ID): Promise<JustErrorResults<ApplyCouponCodeResult> | Promotion>;
    addPromotionsToOrder(ctx: RequestContext, order: Order): Promise<Order>;
    private countPromotionUsagesForCustomer;
    private calculatePriorityScore;
    /**
     * Update the activeSources cache.
     */
    private updatePromotions;
    private validateRequiredConditions;
}
