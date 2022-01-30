import { CreateTaxRateInput, DeletionResponse, UpdateTaxRateInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { RequestContextCacheService } from '../../cache';
import { ListQueryOptions } from '../../common/types/common-types';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';
import { TaxRate } from '../../entity/tax-rate/tax-rate.entity';
import { Zone } from '../../entity/zone/zone.entity';
import { EventBus } from '../../event-bus/event-bus';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
/**
 * @description
 * Contains methods relating to {@link TaxRate} entities.
 *
 * @docsCategory services
 */
export declare class TaxRateService {
    private connection;
    private eventBus;
    private listQueryBuilder;
    private cacheService;
    private readonly defaultTaxRate;
    constructor(connection: TransactionalConnection, eventBus: EventBus, listQueryBuilder: ListQueryBuilder, cacheService: RequestContextCacheService);
    findAll(ctx: RequestContext, options?: ListQueryOptions<TaxRate>): Promise<PaginatedList<TaxRate>>;
    findOne(ctx: RequestContext, taxRateId: ID): Promise<TaxRate | undefined>;
    create(ctx: RequestContext, input: CreateTaxRateInput): Promise<TaxRate>;
    update(ctx: RequestContext, input: UpdateTaxRateInput): Promise<TaxRate>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    /**
     * @description
     * Returns the applicable TaxRate based on the specified Zone and TaxCategory. Used when calculating Order
     * prices.
     */
    getApplicableTaxRate(ctx: RequestContext, zone: Zone, taxCategory: TaxCategory): Promise<TaxRate>;
    private getActiveTaxRates;
    private updateActiveTaxRates;
    private findActiveTaxRates;
}
