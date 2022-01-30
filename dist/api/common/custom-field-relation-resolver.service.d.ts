import { ID } from '@vendure/common/lib/shared-types';
import { ConfigService } from '../../config/config.service';
import { RelationCustomFieldConfig } from '../../config/custom-field/custom-field-types';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { VendureEntity } from '../../entity/base/base.entity';
import { ProductPriceApplicator } from '../../service/helpers/product-price-applicator/product-price-applicator';
import { RequestContext } from './request-context';
export interface ResolveRelationConfig {
    ctx: RequestContext;
    entityId: ID;
    entityName: string;
    fieldDef: RelationCustomFieldConfig;
}
export declare class CustomFieldRelationResolverService {
    private connection;
    private configService;
    private productPriceApplicator;
    constructor(connection: TransactionalConnection, configService: ConfigService, productPriceApplicator: ProductPriceApplicator);
    /**
     * @description
     * Used to dynamically resolve related entities in custom fields. Based on the field
     * config, this method is able to query the correct entity or entities from the database
     * to be returned through the GraphQL API.
     */
    resolveRelation(config: ResolveRelationConfig): Promise<VendureEntity | VendureEntity[]>;
    private isTranslatable;
    private applyVariantPrices;
}
