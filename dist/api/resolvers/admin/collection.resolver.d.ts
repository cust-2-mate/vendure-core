import { ConfigurableOperationDefinition, DeletionResponse, MutationCreateCollectionArgs, MutationDeleteCollectionArgs, MutationMoveCollectionArgs, MutationUpdateCollectionArgs, QueryCollectionArgs, QueryCollectionsArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Translated } from '../../../common/types/locale-types';
import { Collection } from '../../../entity/collection/collection.entity';
import { CollectionService } from '../../../service/services/collection.service';
import { FacetValueService } from '../../../service/services/facet-value.service';
import { ConfigurableOperationCodec } from '../../common/configurable-operation-codec';
import { RequestContext } from '../../common/request-context';
export declare class CollectionResolver {
    private collectionService;
    private facetValueService;
    private configurableOperationCodec;
    constructor(collectionService: CollectionService, facetValueService: FacetValueService, configurableOperationCodec: ConfigurableOperationCodec);
    collectionFilters(ctx: RequestContext, args: QueryCollectionsArgs): Promise<ConfigurableOperationDefinition[]>;
    collections(ctx: RequestContext, args: QueryCollectionsArgs): Promise<PaginatedList<Translated<Collection>>>;
    collection(ctx: RequestContext, args: QueryCollectionArgs): Promise<Translated<Collection> | undefined>;
    createCollection(ctx: RequestContext, args: MutationCreateCollectionArgs): Promise<Translated<Collection>>;
    updateCollection(ctx: RequestContext, args: MutationUpdateCollectionArgs): Promise<Translated<Collection>>;
    moveCollection(ctx: RequestContext, args: MutationMoveCollectionArgs): Promise<Translated<Collection>>;
    deleteCollection(ctx: RequestContext, args: MutationDeleteCollectionArgs): Promise<DeletionResponse>;
    /**
     * Encodes any entity IDs used in the filter arguments.
     */
    private encodeFilters;
}
