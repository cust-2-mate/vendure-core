import { CreateAssetResult, MutationAssignAssetsToChannelArgs, MutationCreateAssetsArgs, MutationDeleteAssetArgs, MutationDeleteAssetsArgs, MutationUpdateAssetArgs, QueryAssetArgs, QueryAssetsArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Asset } from '../../../entity/asset/asset.entity';
import { AssetService } from '../../../service/services/asset.service';
import { RequestContext } from '../../common/request-context';
export declare class AssetResolver {
    private assetService;
    constructor(assetService: AssetService);
    asset(ctx: RequestContext, args: QueryAssetArgs): Promise<Asset | undefined>;
    assets(ctx: RequestContext, args: QueryAssetsArgs): Promise<PaginatedList<Asset>>;
    createAssets(ctx: RequestContext, args: MutationCreateAssetsArgs): Promise<CreateAssetResult[]>;
    updateAsset(ctx: RequestContext, { input }: MutationUpdateAssetArgs): Promise<Asset>;
    deleteAsset(ctx: RequestContext, { input: { assetId, force, deleteFromAllChannels } }: MutationDeleteAssetArgs): Promise<import("@vendure/common/lib/generated-types").DeletionResponse>;
    deleteAssets(ctx: RequestContext, { input: { assetIds, force, deleteFromAllChannels } }: MutationDeleteAssetsArgs): Promise<import("@vendure/common/lib/generated-types").DeletionResponse>;
    assignAssetsToChannel(ctx: RequestContext, { input }: MutationAssignAssetsToChannelArgs): Promise<Asset[]>;
}
