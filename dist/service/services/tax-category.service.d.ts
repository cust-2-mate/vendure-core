import { CreateTaxCategoryInput, DeletionResponse, UpdateTaxCategoryInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class TaxCategoryService {
    private connection;
    constructor(connection: TransactionalConnection);
    findAll(ctx: RequestContext): Promise<TaxCategory[]>;
    findOne(ctx: RequestContext, taxCategoryId: ID): Promise<TaxCategory | undefined>;
    create(ctx: RequestContext, input: CreateTaxCategoryInput): Promise<TaxCategory>;
    update(ctx: RequestContext, input: UpdateTaxCategoryInput): Promise<TaxCategory>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
}
