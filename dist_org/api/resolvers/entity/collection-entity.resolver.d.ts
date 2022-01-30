import { CollectionBreadcrumb, ProductVariantListOptions } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Translated } from '../../../common/types/locale-types';
import { Asset, Collection, ProductVariant } from '../../../entity';
import { LocaleStringHydrator } from '../../../service/helpers/locale-string-hydrator/locale-string-hydrator';
import { AssetService } from '../../../service/services/asset.service';
import { CollectionService } from '../../../service/services/collection.service';
import { ProductVariantService } from '../../../service/services/product-variant.service';
import { ApiType } from '../../common/get-api-type';
import { RequestContext } from '../../common/request-context';
export declare class CollectionEntityResolver {
    private productVariantService;
    private collectionService;
    private assetService;
    private localeStringHydrator;
    constructor(productVariantService: ProductVariantService, collectionService: CollectionService, assetService: AssetService, localeStringHydrator: LocaleStringHydrator);
    name(ctx: RequestContext, collection: Collection): Promise<string>;
    slug(ctx: RequestContext, collection: Collection): Promise<string>;
    description(ctx: RequestContext, collection: Collection): Promise<string>;
    productVariants(ctx: RequestContext, collection: Collection, args: {
        options: ProductVariantListOptions;
    }, apiType: ApiType): Promise<PaginatedList<Translated<ProductVariant>>>;
    breadcrumbs(ctx: RequestContext, collection: Collection): Promise<CollectionBreadcrumb[]>;
    parent(ctx: RequestContext, collection: Collection, apiType: ApiType): Promise<Collection | undefined>;
    children(ctx: RequestContext, collection: Collection, apiType: ApiType): Promise<Collection[]>;
    featuredAsset(ctx: RequestContext, collection: Collection): Promise<Asset | undefined>;
    assets(ctx: RequestContext, collection: Collection): Promise<Asset[] | undefined>;
}
