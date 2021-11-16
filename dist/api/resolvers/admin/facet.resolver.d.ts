import { DeletionResponse, MutationCreateFacetArgs, MutationCreateFacetValuesArgs, MutationDeleteFacetArgs, MutationDeleteFacetValuesArgs, MutationUpdateFacetArgs, MutationUpdateFacetValuesArgs, QueryFacetArgs, QueryFacetsArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Translated } from '../../../common/types/locale-types';
import { ConfigService } from '../../../config/config.service';
import { FacetValue } from '../../../entity/facet-value/facet-value.entity';
import { Facet } from '../../../entity/facet/facet.entity';
import { FacetValueService } from '../../../service/services/facet-value.service';
import { FacetService } from '../../../service/services/facet.service';
import { RequestContext } from '../../common/request-context';
export declare class FacetResolver {
    private facetService;
    private facetValueService;
    private configService;
    constructor(facetService: FacetService, facetValueService: FacetValueService, configService: ConfigService);
    facets(ctx: RequestContext, args: QueryFacetsArgs): Promise<PaginatedList<Translated<Facet>>>;
    facet(ctx: RequestContext, args: QueryFacetArgs): Promise<Translated<Facet> | undefined>;
    createFacet(ctx: RequestContext, args: MutationCreateFacetArgs): Promise<Translated<Facet>>;
    updateFacet(ctx: RequestContext, args: MutationUpdateFacetArgs): Promise<Translated<Facet>>;
    deleteFacet(ctx: RequestContext, args: MutationDeleteFacetArgs): Promise<DeletionResponse>;
    createFacetValues(ctx: RequestContext, args: MutationCreateFacetValuesArgs): Promise<Array<Translated<FacetValue>>>;
    updateFacetValues(ctx: RequestContext, args: MutationUpdateFacetValuesArgs): Promise<Array<Translated<FacetValue>>>;
    deleteFacetValues(ctx: RequestContext, args: MutationDeleteFacetValuesArgs): Promise<DeletionResponse[]>;
}
