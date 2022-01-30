import { OnModuleInit } from '@nestjs/common';
import { ConfigurableOperationDefinition, CreateCollectionInput, DeletionResponse, MoveCollectionInput, UpdateCollectionInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext, SerializedRequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { Translated } from '../../common/types/locale-types';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Collection } from '../../entity/collection/collection.entity';
import { EventBus } from '../../event-bus/event-bus';
import { JobQueueService } from '../../job-queue/job-queue.service';
import { ConfigArgService } from '../helpers/config-arg/config-arg.service';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { SlugValidator } from '../helpers/slug-validator/slug-validator';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { AssetService } from './asset.service';
import { ChannelService } from './channel.service';
import { FacetValueService } from './facet-value.service';
export declare type ApplyCollectionFiltersJobData = {
    ctx: SerializedRequestContext;
    collectionIds: ID[];
    applyToChangedVariantsOnly?: boolean;
};
/**
 * @description
 * Contains methods relating to {@link Collection} entities.
 *
 * @docsCategory services
 */
export declare class CollectionService implements OnModuleInit {
    private connection;
    private channelService;
    private assetService;
    private facetValueService;
    private listQueryBuilder;
    private translatableSaver;
    private eventBus;
    private jobQueueService;
    private configService;
    private slugValidator;
    private configArgService;
    private customFieldRelationService;
    private rootCollection;
    private applyFiltersQueue;
    constructor(connection: TransactionalConnection, channelService: ChannelService, assetService: AssetService, facetValueService: FacetValueService, listQueryBuilder: ListQueryBuilder, translatableSaver: TranslatableSaver, eventBus: EventBus, jobQueueService: JobQueueService, configService: ConfigService, slugValidator: SlugValidator, configArgService: ConfigArgService, customFieldRelationService: CustomFieldRelationService);
    /**
     * @internal
     */
    onModuleInit(): Promise<void>;
    findAll(ctx: RequestContext, options?: ListQueryOptions<Collection>): Promise<PaginatedList<Translated<Collection>>>;
    findOne(ctx: RequestContext, collectionId: ID): Promise<Translated<Collection> | undefined>;
    findByIds(ctx: RequestContext, ids: ID[]): Promise<Array<Translated<Collection>>>;
    findOneBySlug(ctx: RequestContext, slug: string): Promise<Translated<Collection> | undefined>;
    /**
     * @description
     * Returns all configured CollectionFilters, as specified by the {@link CatalogOptions}.
     */
    getAvailableFilters(ctx: RequestContext): ConfigurableOperationDefinition[];
    getParent(ctx: RequestContext, collectionId: ID): Promise<Collection | undefined>;
    /**
     * @description
     * Returns all child Collections of the Collection with the given id.
     */
    getChildren(ctx: RequestContext, collectionId: ID): Promise<Collection[]>;
    /**
     * @description
     * Returns an array of name/id pairs representing all ancestor Collections up
     * to the Root Collection.
     */
    getBreadcrumbs(ctx: RequestContext, collection: Collection): Promise<Array<{
        name: string;
        id: ID;
    }>>;
    /**
     * @description
     * Returns all Collections which are associated with the given Product ID.
     */
    getCollectionsByProductId(ctx: RequestContext, productId: ID, publicOnly: boolean): Promise<Array<Translated<Collection>>>;
    /**
     * @description
     * Returns the descendants of a Collection as a flat array. The depth of the traversal can be limited
     * with the maxDepth argument. So to get only the immediate children, set maxDepth = 1.
     */
    getDescendants(ctx: RequestContext, rootId: ID, maxDepth?: number): Promise<Array<Translated<Collection>>>;
    /**
     * @description
     * Gets the ancestors of a given collection. Note that since ProductCategories are implemented as an adjacency list, this method
     * will produce more queries the deeper the collection is in the tree.
     */
    getAncestors(collectionId: ID): Promise<Collection[]>;
    getAncestors(collectionId: ID, ctx: RequestContext): Promise<Array<Translated<Collection>>>;
    create(ctx: RequestContext, input: CreateCollectionInput): Promise<Translated<Collection>>;
    update(ctx: RequestContext, input: UpdateCollectionInput): Promise<Translated<Collection>>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    /**
     * @description
     * Moves a Collection by specifying the parent Collection ID, and an index representing the order amongst
     * its siblings.
     */
    move(ctx: RequestContext, input: MoveCollectionInput): Promise<Translated<Collection>>;
    private getCollectionFiltersFromInput;
    /**
     * Applies the CollectionFilters
     *
     * If applyToChangedVariantsOnly (default: true) is true, then apply collection job will process only changed variants
     * If applyToChangedVariantsOnly (default: true) is false, then apply collection job will process all variants
     * This param is used when we update collection and collection filters are changed to update all
     * variants (because other attributes of collection can be changed https://github.com/vendure-ecommerce/vendure/issues/1015)
     */
    private applyCollectionFiltersInternal;
    /**
     * Applies the CollectionFilters and returns an array of ProductVariant entities which match.
     */
    private getFilteredProductVariants;
    /**
     * Returns the IDs of the Collection's ProductVariants.
     */
    getCollectionProductVariantIds(collection: Collection, ctx?: RequestContext): Promise<ID[]>;
    /**
     * Returns the next position value in the given parent collection.
     */
    private getNextPositionInParent;
    private getParentCollection;
    private getRootCollection;
}
