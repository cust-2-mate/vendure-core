import { CreatePromotionResult, DeletionResponse, MutationAssignPromotionsToChannelArgs, MutationCreatePromotionArgs, MutationDeletePromotionArgs, MutationRemovePromotionsFromChannelArgs, MutationUpdatePromotionArgs, QueryPromotionArgs, QueryPromotionsArgs, UpdatePromotionResult } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { ErrorResultUnion } from '../../../common/error/error-result';
import { Promotion } from '../../../entity/promotion/promotion.entity';
import { PromotionService } from '../../../service/services/promotion.service';
import { ConfigurableOperationCodec } from '../../common/configurable-operation-codec';
import { RequestContext } from '../../common/request-context';
export declare class PromotionResolver {
    private promotionService;
    private configurableOperationCodec;
    constructor(promotionService: PromotionService, configurableOperationCodec: ConfigurableOperationCodec);
    promotions(ctx: RequestContext, args: QueryPromotionsArgs): Promise<PaginatedList<Promotion>>;
    promotion(ctx: RequestContext, args: QueryPromotionArgs): Promise<Promotion | undefined>;
    promotionConditions(ctx: RequestContext): import("@vendure/common/lib/generated-types").ConfigurableOperationDefinition[];
    promotionActions(ctx: RequestContext): import("@vendure/common/lib/generated-types").ConfigurableOperationDefinition[];
    createPromotion(ctx: RequestContext, args: MutationCreatePromotionArgs): Promise<ErrorResultUnion<CreatePromotionResult, Promotion>>;
    updatePromotion(ctx: RequestContext, args: MutationUpdatePromotionArgs): Promise<ErrorResultUnion<UpdatePromotionResult, Promotion>>;
    deletePromotion(ctx: RequestContext, args: MutationDeletePromotionArgs): Promise<DeletionResponse>;
    assignPromotionsToChannel(ctx: RequestContext, args: MutationAssignPromotionsToChannelArgs): Promise<Promotion[]>;
    removePromotionsFromChannel(ctx: RequestContext, args: MutationRemovePromotionsFromChannelArgs): Promise<Promotion[]>;
    /**
     * Encodes any entity IDs used in the filter arguments.
     */
    private encodeConditionsAndActions;
}
