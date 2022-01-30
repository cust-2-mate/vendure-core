import { CreateFacetInput, DeletionResponse, LanguageCode, UpdateFacetInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { Translated } from '../../common/types/locale-types';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Facet } from '../../entity/facet/facet.entity';
import { EventBus } from '../../event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { ChannelService } from './channel.service';
import { FacetValueService } from './facet-value.service';
/**
 * @description
 * Contains methods relating to {@link Facet} entities.
 *
 * @docsCategory services
 */
export declare class FacetService {
    private connection;
    private facetValueService;
    private translatableSaver;
    private listQueryBuilder;
    private configService;
    private channelService;
    private customFieldRelationService;
    private eventBus;
    constructor(connection: TransactionalConnection, facetValueService: FacetValueService, translatableSaver: TranslatableSaver, listQueryBuilder: ListQueryBuilder, configService: ConfigService, channelService: ChannelService, customFieldRelationService: CustomFieldRelationService, eventBus: EventBus);
    findAll(ctx: RequestContext, options?: ListQueryOptions<Facet>): Promise<PaginatedList<Translated<Facet>>>;
    findOne(ctx: RequestContext, facetId: ID): Promise<Translated<Facet> | undefined>;
    findByCode(facetCode: string, lang: LanguageCode): Promise<Translated<Facet> | undefined>;
    /**
     * @description
     * Returns the Facet which contains the given FacetValue id.
     */
    findByFacetValueId(ctx: RequestContext, id: ID): Promise<Translated<Facet> | undefined>;
    create(ctx: RequestContext, input: CreateFacetInput): Promise<Translated<Facet>>;
    update(ctx: RequestContext, input: UpdateFacetInput): Promise<Translated<Facet>>;
    delete(ctx: RequestContext, id: ID, force?: boolean): Promise<DeletionResponse>;
    /**
     * Checks to ensure the Facet code is unique. If there is a conflict, then the code is suffixed
     * with an incrementing integer.
     */
    private ensureUniqueCode;
}
