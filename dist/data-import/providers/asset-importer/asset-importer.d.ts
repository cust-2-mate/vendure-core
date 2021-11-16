import { ConfigService } from '../../../config/config.service';
import { Asset } from '../../../entity/asset/asset.entity';
import { AssetService } from '../../../service/services/asset.service';
export declare class AssetImporter {
    private configService;
    private assetService;
    private assetMap;
    constructor(configService: ConfigService, assetService: AssetService);
    /**
     * Creates Asset entities for the given paths, using the assetMap cache to prevent the
     * creation of duplicates.
     */
    getAssets(assetPaths: string[]): Promise<{
        assets: Asset[];
        errors: string[];
    }>;
}
