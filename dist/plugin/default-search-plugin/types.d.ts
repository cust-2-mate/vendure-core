import { SearchInput as GeneratedSearchInput } from '@vendure/common/lib/generated-types';
import { ID, JsonCompatible } from '@vendure/common/lib/shared-types';
import { SerializedRequestContext } from '../../api/common/request-context';
import { Asset } from '../../entity/asset/asset.entity';
/**
 * @description
 * Options which configure the behaviour of the DefaultSearchPlugin
 *
 * @docsCategory DefaultSearchPlugin
 */
export interface DefaultSearchPluginInitOptions {
    /**
     * @description
     * If set to `true`, the stock status of a ProductVariant (isStock: Boolean) will
     * be exposed in the `search` query results. Enabling this option on an existing
     * Vendure installation will require a DB migration/synchronization.
     *
     * @default false.
     */
    indexStockStatus?: boolean;
    /**
     * @description
     * If set to `true`, updates to Products, ProductVariants and Collections will not immediately
     * trigger an update to the search index. Instead, all these changes will be buffered and will
     * only be run via a call to the `runPendingSearchIndexUpdates` mutation in the Admin API.
     *
     * This is very useful for installations with a large number of ProductVariants and/or
     * Collections, as the buffering allows better control over when these expensive jobs are run,
     * and also performs optimizations to minimize the amount of work that needs to be performed by
     * the worker.
     *
     * @since 1.3.0
     * @default false
     */
    bufferUpdates?: boolean;
}
/**
 * Because the `inStock` field is opt-in based on the `indexStockStatus` option,
 * it is not included by default in the generated types. Thus we manually augment
 * the generated type here.
 */
export interface SearchInput extends GeneratedSearchInput {
    inStock?: boolean;
}
export declare type ReindexMessageResponse = {
    total: number;
    completed: number;
    duration: number;
};
export declare type ReindexMessageData = {
    ctx: SerializedRequestContext;
};
export declare type UpdateProductMessageData = {
    ctx: SerializedRequestContext;
    productId: ID;
};
export declare type UpdateVariantMessageData = {
    ctx: SerializedRequestContext;
    variantIds: ID[];
};
export declare type UpdateVariantsByIdMessageData = {
    ctx: SerializedRequestContext;
    ids: ID[];
};
export declare type UpdateAssetMessageData = {
    ctx: SerializedRequestContext;
    asset: JsonCompatible<Required<Asset>>;
};
export declare type ProductChannelMessageData = {
    ctx: SerializedRequestContext;
    productId: ID;
    channelId: ID;
};
export declare type VariantChannelMessageData = {
    ctx: SerializedRequestContext;
    productVariantId: ID;
    channelId: ID;
};
declare type NamedJobData<Type extends string, MessageData> = {
    type: Type;
} & MessageData;
export declare type ReindexJobData = NamedJobData<'reindex', ReindexMessageData>;
export declare type UpdateProductJobData = NamedJobData<'update-product', UpdateProductMessageData>;
export declare type UpdateVariantsJobData = NamedJobData<'update-variants', UpdateVariantMessageData>;
export declare type DeleteProductJobData = NamedJobData<'delete-product', UpdateProductMessageData>;
export declare type DeleteVariantJobData = NamedJobData<'delete-variant', UpdateVariantMessageData>;
export declare type UpdateVariantsByIdJobData = NamedJobData<'update-variants-by-id', UpdateVariantsByIdMessageData>;
export declare type UpdateAssetJobData = NamedJobData<'update-asset', UpdateAssetMessageData>;
export declare type DeleteAssetJobData = NamedJobData<'delete-asset', UpdateAssetMessageData>;
export declare type AssignProductToChannelJobData = NamedJobData<'assign-product-to-channel', ProductChannelMessageData>;
export declare type RemoveProductFromChannelJobData = NamedJobData<'remove-product-from-channel', ProductChannelMessageData>;
export declare type AssignVariantToChannelJobData = NamedJobData<'assign-variant-to-channel', VariantChannelMessageData>;
export declare type RemoveVariantFromChannelJobData = NamedJobData<'remove-variant-from-channel', VariantChannelMessageData>;
export declare type UpdateIndexQueueJobData = ReindexJobData | UpdateProductJobData | UpdateVariantsJobData | DeleteProductJobData | DeleteVariantJobData | UpdateVariantsByIdJobData | UpdateAssetJobData | DeleteAssetJobData | AssignProductToChannelJobData | RemoveProductFromChannelJobData | AssignVariantToChannelJobData | RemoveVariantFromChannelJobData;
export {};
