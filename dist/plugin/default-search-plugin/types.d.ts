import { ID, JsonCompatible } from '@vendure/common/lib/shared-types';
import { SerializedRequestContext } from '../../api/common/request-context';
import { Asset } from '../../entity/asset/asset.entity';
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
declare type UpdateProductJobData = NamedJobData<'update-product', UpdateProductMessageData>;
declare type UpdateVariantsJobData = NamedJobData<'update-variants', UpdateVariantMessageData>;
declare type DeleteProductJobData = NamedJobData<'delete-product', UpdateProductMessageData>;
declare type DeleteVariantJobData = NamedJobData<'delete-variant', UpdateVariantMessageData>;
declare type UpdateVariantsByIdJobData = NamedJobData<'update-variants-by-id', UpdateVariantsByIdMessageData>;
declare type UpdateAssetJobData = NamedJobData<'update-asset', UpdateAssetMessageData>;
declare type DeleteAssetJobData = NamedJobData<'delete-asset', UpdateAssetMessageData>;
declare type AssignProductToChannelJobData = NamedJobData<'assign-product-to-channel', ProductChannelMessageData>;
declare type RemoveProductFromChannelJobData = NamedJobData<'remove-product-from-channel', ProductChannelMessageData>;
declare type AssignVariantToChannelJobData = NamedJobData<'assign-variant-to-channel', VariantChannelMessageData>;
declare type RemoveVariantFromChannelJobData = NamedJobData<'remove-variant-from-channel', VariantChannelMessageData>;
export declare type UpdateIndexQueueJobData = ReindexJobData | UpdateProductJobData | UpdateVariantsJobData | DeleteProductJobData | DeleteVariantJobData | UpdateVariantsByIdJobData | UpdateAssetJobData | DeleteAssetJobData | AssignProductToChannelJobData | RemoveProductFromChannelJobData | AssignVariantToChannelJobData | RemoveVariantFromChannelJobData;
export {};
