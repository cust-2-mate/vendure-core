import { DeletionResponse, MutationCreateCountryArgs, MutationDeleteCountryArgs, MutationUpdateCountryArgs, QueryCountriesArgs, QueryCountryArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { Translated } from '../../../common/types/locale-types';
import { Country } from '../../../entity/country/country.entity';
import { CountryService } from '../../../service/services/country.service';
import { RequestContext } from '../../common/request-context';
export declare class CountryResolver {
    private countryService;
    constructor(countryService: CountryService);
    countries(ctx: RequestContext, args: QueryCountriesArgs): Promise<PaginatedList<Translated<Country>>>;
    country(ctx: RequestContext, args: QueryCountryArgs): Promise<Translated<Country> | undefined>;
    createCountry(ctx: RequestContext, args: MutationCreateCountryArgs): Promise<Translated<Country>>;
    updateCountry(ctx: RequestContext, args: MutationUpdateCountryArgs): Promise<Translated<Country>>;
    deleteCountry(ctx: RequestContext, args: MutationDeleteCountryArgs): Promise<DeletionResponse>;
}
