import { QuerySearchArgs, SearchInput, SearchResponse } from '@vendure/common/lib/generated-types';
import { Omit } from '@vendure/common/lib/omit';
import { RequestContext } from '../../api/common/request-context';
import { SearchResolver as BaseSearchResolver } from '../../api/resolvers/admin/search.resolver';
import { Collection, FacetValue } from '../../entity';
import { FulltextSearchService } from './fulltext-search.service';
export declare class ShopFulltextSearchResolver implements Omit<BaseSearchResolver, 'reindex'> {
    private fulltextSearchService;
    constructor(fulltextSearchService: FulltextSearchService);
    search(ctx: RequestContext, args: QuerySearchArgs): Promise<Omit<SearchResponse, 'facetValues' | 'collections'>>;
    facetValues(ctx: RequestContext, parent: {
        input: SearchInput;
    }): Promise<Array<{
        facetValue: FacetValue;
        count: number;
    }>>;
    collections(ctx: RequestContext, parent: {
        input: SearchInput;
    }): Promise<Array<{
        collection: Collection;
        count: number;
    }>>;
}
export declare class AdminFulltextSearchResolver implements BaseSearchResolver {
    private fulltextSearchService;
    constructor(fulltextSearchService: FulltextSearchService);
    search(ctx: RequestContext, args: QuerySearchArgs): Promise<Omit<SearchResponse, 'facetValues' | 'collections'>>;
    facetValues(ctx: RequestContext, parent: {
        input: SearchInput;
    }): Promise<Array<{
        facetValue: FacetValue;
        count: number;
    }>>;
    collections(ctx: RequestContext, parent: {
        input: SearchInput;
    }): Promise<Array<{
        collection: Collection;
        count: number;
    }>>;
    reindex(ctx: RequestContext): Promise<import("../..").Job<any>>;
}
