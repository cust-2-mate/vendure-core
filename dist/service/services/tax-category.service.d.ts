import { CreateTaxCategoryInput, DeletionResponse, UpdateTaxCategoryInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';
import { EventBus } from '../../event-bus';
/**
 * @description
 * Contains methods relating to {@link TaxCategory} entities.
 *
 * @docsCategory services
 */
export declare class TaxCategoryService {
    private connection;
    private eventBus;
    constructor(connection: TransactionalConnection, eventBus: EventBus);
    findAll(ctx: RequestContext): Promise<TaxCategory[]>;
    findOne(ctx: RequestContext, taxCategoryId: ID): Promise<TaxCategory | undefined>;
    create(ctx: RequestContext, input: CreateTaxCategoryInput): Promise<TaxCategory>;
    update(ctx: RequestContext, input: UpdateTaxCategoryInput): Promise<TaxCategory>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
}
