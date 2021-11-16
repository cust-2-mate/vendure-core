import { DeletionResponse, MutationCreateTaxRateArgs, MutationDeleteTaxRateArgs, MutationUpdateTaxRateArgs, QueryTaxRateArgs, QueryTaxRatesArgs } from '@vendure/common/lib/generated-types';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { TaxRate } from '../../../entity/tax-rate/tax-rate.entity';
import { TaxRateService } from '../../../service/services/tax-rate.service';
import { RequestContext } from '../../common/request-context';
export declare class TaxRateResolver {
    private taxRateService;
    constructor(taxRateService: TaxRateService);
    taxRates(ctx: RequestContext, args: QueryTaxRatesArgs): Promise<PaginatedList<TaxRate>>;
    taxRate(ctx: RequestContext, args: QueryTaxRateArgs): Promise<TaxRate | undefined>;
    createTaxRate(ctx: RequestContext, args: MutationCreateTaxRateArgs): Promise<TaxRate>;
    updateTaxRate(ctx: RequestContext, args: MutationUpdateTaxRateArgs): Promise<TaxRate>;
    deleteTaxRate(ctx: RequestContext, args: MutationDeleteTaxRateArgs): Promise<DeletionResponse>;
}
