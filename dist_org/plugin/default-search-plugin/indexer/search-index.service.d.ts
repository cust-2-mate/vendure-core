import { OnApplicationBootstrap } from '@nestjs/common';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../../api/common/request-context';
import { Asset } from '../../../entity/asset/asset.entity';
import { ProductVariant } from '../../../entity/product-variant/product-variant.entity';
import { Product } from '../../../entity/product/product.entity';
import { JobQueueService } from '../../../job-queue/job-queue.service';
import { UpdateIndexQueueJobData } from '../types';
import { IndexerController } from './indexer.controller';
/**
 * This service is responsible for messaging the {@link IndexerController} with search index updates.
 */
export declare class SearchIndexService implements OnApplicationBootstrap {
    private jobService;
    private indexerController;
    private updateIndexQueue;
    constructor(jobService: JobQueueService, indexerController: IndexerController);
    onApplicationBootstrap(): Promise<void>;
    reindex(ctx: RequestContext): Promise<import("../../../job-queue/subscribable-job").SubscribableJob<UpdateIndexQueueJobData>>;
    updateProduct(ctx: RequestContext, product: Product): void;
    updateVariants(ctx: RequestContext, variants: ProductVariant[]): void;
    deleteProduct(ctx: RequestContext, product: Product): void;
    deleteVariant(ctx: RequestContext, variants: ProductVariant[]): void;
    updateVariantsById(ctx: RequestContext, ids: ID[]): void;
    updateAsset(ctx: RequestContext, asset: Asset): void;
    deleteAsset(ctx: RequestContext, asset: Asset): void;
    assignProductToChannel(ctx: RequestContext, productId: ID, channelId: ID): void;
    removeProductFromChannel(ctx: RequestContext, productId: ID, channelId: ID): void;
    assignVariantToChannel(ctx: RequestContext, productVariantId: ID, channelId: ID): void;
    removeVariantFromChannel(ctx: RequestContext, productVariantId: ID, channelId: ID): void;
    private jobWithProgress;
}
