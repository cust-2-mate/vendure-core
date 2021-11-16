import { CreateFacetValueInput, CreateFacetValueWithFacetInput, DeletionResponse, LanguageCode, UpdateFacetValueInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { Translated } from '../../common/types/locale-types';
import { ConfigService } from '../../config/config.service';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { Facet } from '../../entity/facet/facet.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
export declare class FacetValueService {
    private connection;
    private translatableSaver;
    private configService;
    private customFieldRelationService;
    private channelService;
    constructor(connection: TransactionalConnection, translatableSaver: TranslatableSaver, configService: ConfigService, customFieldRelationService: CustomFieldRelationService, channelService: ChannelService);
    findAll(lang: LanguageCode): Promise<Array<Translated<FacetValue>>>;
    findOne(ctx: RequestContext, id: ID): Promise<Translated<FacetValue> | undefined>;
    findByIds(ctx: RequestContext, ids: ID[]): Promise<Array<Translated<FacetValue>>>;
    findByFacetId(ctx: RequestContext, id: ID): Promise<Array<Translated<FacetValue>>>;
    create(ctx: RequestContext, facet: Facet, input: CreateFacetValueInput | CreateFacetValueWithFacetInput): Promise<Translated<FacetValue>>;
    update(ctx: RequestContext, input: UpdateFacetValueInput): Promise<Translated<FacetValue>>;
    delete(ctx: RequestContext, id: ID, force?: boolean): Promise<DeletionResponse>;
    /**
     * Checks for usage of the given FacetValues in any Products or Variants, and returns the counts.
     */
    checkFacetValueUsage(ctx: RequestContext, facetValueIds: ID[]): Promise<{
        productCount: number;
        variantCount: number;
    }>;
}
