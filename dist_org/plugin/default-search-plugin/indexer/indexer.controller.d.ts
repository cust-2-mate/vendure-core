import { Observable } from 'rxjs';
import { ConfigService } from '../../../config/config.service';
import { ProductVariantService } from '../../../service/services/product-variant.service';
import { TransactionalConnection } from '../../../service/transaction/transactional-connection';
import { ProductChannelMessageData, ReindexMessageData, ReindexMessageResponse, UpdateAssetMessageData, UpdateProductMessageData, UpdateVariantMessageData, UpdateVariantsByIdMessageData, VariantChannelMessageData } from '../types';
export declare const BATCH_SIZE = 1000;
export declare const variantRelations: string[];
export declare const workerLoggerCtx = "DefaultSearchPlugin Worker";
export declare class IndexerController {
    private connection;
    private productVariantService;
    private configService;
    private queue;
    constructor(connection: TransactionalConnection, productVariantService: ProductVariantService, configService: ConfigService);
    reindex({ ctx: rawContext }: ReindexMessageData): Observable<ReindexMessageResponse>;
    updateVariantsById({ ctx: rawContext, ids, }: UpdateVariantsByIdMessageData): Observable<ReindexMessageResponse>;
    updateProduct(data: UpdateProductMessageData): Promise<boolean>;
    updateVariants(data: UpdateVariantMessageData): Promise<boolean>;
    deleteProduct(data: UpdateProductMessageData): Promise<boolean>;
    deleteVariant(data: UpdateVariantMessageData): Promise<boolean>;
    assignProductToChannel(data: ProductChannelMessageData): Promise<boolean>;
    removeProductFromChannel(data: ProductChannelMessageData): Promise<boolean>;
    assignVariantToChannel(data: VariantChannelMessageData): Promise<boolean>;
    removeVariantFromChannel(data: VariantChannelMessageData): Promise<boolean>;
    updateAsset(data: UpdateAssetMessageData): Promise<boolean>;
    deleteAsset(data: UpdateAssetMessageData): Promise<boolean>;
    private updateProductInChannel;
    private updateVariantsInChannel;
    private deleteProductInChannel;
    private getSearchIndexQueryBuilder;
    private saveVariants;
    /**
     * If a Product has no variants, we create a synthetic variant for the purposes
     * of making that product visible via the search query.
     */
    private saveSyntheticVariant;
    /**
     * Removes any synthetic variants for the given product
     */
    private removeSyntheticVariants;
    private getTranslation;
    private getFacetIds;
    private getFacetValueIds;
    /**
     * Remove items from the search index
     */
    private removeSearchIndexItems;
    /**
     * Prevent postgres errors from too-long indices
     * https://github.com/vendure-ecommerce/vendure/issues/745
     */
    private constrainDescription;
}
