import { DeletionResponse, MutationCreateTaxCategoryArgs, MutationDeleteTaxCategoryArgs, MutationUpdateTaxCategoryArgs, QueryTaxCategoryArgs } from '@vendure/common/lib/generated-types';
import { TaxCategory } from '../../../entity/tax-category/tax-category.entity';
import { TaxCategoryService } from '../../../service/services/tax-category.service';
import { RequestContext } from '../../common/request-context';
export declare class TaxCategoryResolver {
    private taxCategoryService;
    constructor(taxCategoryService: TaxCategoryService);
    taxCategories(ctx: RequestContext): Promise<TaxCategory[]>;
    taxCategory(ctx: RequestContext, args: QueryTaxCategoryArgs): Promise<TaxCategory | undefined>;
    createTaxCategory(ctx: RequestContext, args: MutationCreateTaxCategoryArgs): Promise<TaxCategory>;
    updateTaxCategory(ctx: RequestContext, args: MutationUpdateTaxCategoryArgs): Promise<TaxCategory>;
    deleteTaxCategory(ctx: RequestContext, args: MutationDeleteTaxCategoryArgs): Promise<DeletionResponse>;
}
