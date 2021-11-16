import { CreateCountryInput, DeletionResponse, UpdateCountryInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ListQueryOptions } from '../../common/types/common-types';
import { Translated } from '../../common/types/locale-types';
import { Country } from '../../entity/country/country.entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ZoneService } from './zone.service';
export declare class CountryService {
    private connection;
    private listQueryBuilder;
    private translatableSaver;
    private zoneService;
    constructor(connection: TransactionalConnection, listQueryBuilder: ListQueryBuilder, translatableSaver: TranslatableSaver, zoneService: ZoneService);
    findAll(ctx: RequestContext, options?: ListQueryOptions<Country>): Promise<PaginatedList<Translated<Country>>>;
    findOne(ctx: RequestContext, countryId: ID): Promise<Translated<Country> | undefined>;
    /**
     * Returns an array of enabled Countries, intended for use in a public-facing (ie. Shop) API.
     */
    findAllAvailable(ctx: RequestContext): Promise<Array<Translated<Country>>>;
    findOneByCode(ctx: RequestContext, countryCode: string): Promise<Translated<Country>>;
    create(ctx: RequestContext, input: CreateCountryInput): Promise<Translated<Country>>;
    update(ctx: RequestContext, input: UpdateCountryInput): Promise<Translated<Country>>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
}
