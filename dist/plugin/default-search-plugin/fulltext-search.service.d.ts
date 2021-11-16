import { SearchInput, SearchResponse } from '@vendure/common/lib/generated-types';
import { Omit } from '@vendure/common/lib/omit';
import { RequestContext } from '../../api/common/request-context';
import { Collection, FacetValue } from '../../entity';
import { EventBus } from '../../event-bus/event-bus';
import { Job } from '../../job-queue/job';
import { FacetValueService } from '../../service/services/facet-value.service';
import { CollectionService } from '../../service/services/collection.service';
import { ProductVariantService } from '../../service/services/product-variant.service';
import { SearchService } from '../../service/services/search.service';
import { TransactionalConnection } from '../../service/transaction/transactional-connection';
import { SearchIndexService } from './indexer/search-index.service';
/**
 * Search indexing and full-text search for supported databases. See the various
 * SearchStrategy implementations for db-specific code.
 */
export declare class FulltextSearchService {
    private connection;
    private eventBus;
    private facetValueService;
    private collectionService;
    private productVariantService;
    private searchIndexService;
    private searchService;
    private searchStrategy;
    private readonly minTermLength;
    constructor(connection: TransactionalConnection, eventBus: EventBus, facetValueService: FacetValueService, collectionService: CollectionService, productVariantService: ProductVariantService, searchIndexService: SearchIndexService, searchService: SearchService);
    /**
     * Perform a fulltext search according to the provided input arguments.
     */
    search(ctx: RequestContext, input: SearchInput, enabledOnly?: boolean): Promise<Omit<Omit<SearchResponse, 'facetValues'>, 'collections'>>;
    /**
     * Return a list of all FacetValues which appear in the result set.
     */
    facetValues(ctx: RequestContext, input: SearchInput, enabledOnly?: boolean): Promise<Array<{
        facetValue: FacetValue;
        count: number;
    }>>;
    /**
     * Return a list of all Collections which appear in the result set.
     */
    collections(ctx: RequestContext, input: SearchInput, enabledOnly?: boolean): Promise<Array<{
        collection: Collection;
        count: number;
    }>>;
    /**
     * Rebuilds the full search index.
     */
    reindex(ctx: RequestContext): Promise<Job>;
    /**
     * Sets the SearchStrategy appropriate to th configured database type.
     */
    private setSearchStrategy;
}
