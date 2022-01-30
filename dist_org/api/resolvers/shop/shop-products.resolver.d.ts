import { QueryCollectionArgs, QueryCollectionsArgs, QueryFacetArgs, QueryFacetsArgs, QueryProductArgs, SearchResponse } from '@vendure/common/lib/generated-shop-types';
import { QueryProductsArgs } from '@vendure/common/lib/generated-shop-types';
import { Omit } from '@vendure/common/lib/omit';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Translated } from '../../../common/types/locale-types';
import { Collection } from '../../../entity/collection/collection.entity';
import { Facet } from '../../../entity/facet/facet.entity';
import { Product } from '../../../entity/product/product.entity';
import { CollectionService, FacetService } from '../../../service';
import { FacetValueService } from '../../../service/services/facet-value.service';
import { ProductVariantService } from '../../../service/services/product-variant.service';
import { ProductService } from '../../../service/services/product.service';
import { RequestContext } from '../../common/request-context';
export declare class ShopProductsResolver {
    private productService;
    private productVariantService;
    private facetValueService;
    private collectionService;
    private facetService;
    constructor(productService: ProductService, productVariantService: ProductVariantService, facetValueService: FacetValueService, collectionService: CollectionService, facetService: FacetService);
    products(ctx: RequestContext, args: QueryProductsArgs): Promise<PaginatedList<Translated<Product>>>;
    product(ctx: RequestContext, args: QueryProductArgs): Promise<Translated<Product> | undefined>;
    collections(ctx: RequestContext, args: QueryCollectionsArgs): Promise<PaginatedList<Translated<Collection>>>;
    collection(ctx: RequestContext, args: QueryCollectionArgs): Promise<Translated<Collection> | undefined>;
    search(...args: any): Promise<Omit<SearchResponse, 'facetValues'>>;
    facets(ctx: RequestContext, args: QueryFacetsArgs): Promise<PaginatedList<Translated<Facet>>>;
    facet(ctx: RequestContext, args: QueryFacetArgs): Promise<Translated<Facet> | undefined>;
}
