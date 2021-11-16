import { CreateProductOptionGroupInput, UpdateProductOptionGroupInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { Translated } from '../../common/types/locale-types';
import { ProductOptionGroup } from '../../entity/product-option-group/product-option-group.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class ProductOptionGroupService {
    private connection;
    private translatableSaver;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, translatableSaver: TranslatableSaver, customFieldRelationService: CustomFieldRelationService);
    findAll(ctx: RequestContext, filterTerm?: string): Promise<Array<Translated<ProductOptionGroup>>>;
    findOne(ctx: RequestContext, id: ID): Promise<Translated<ProductOptionGroup> | undefined>;
    getOptionGroupsByProductId(ctx: RequestContext, id: ID): Promise<Array<Translated<ProductOptionGroup>>>;
    create(ctx: RequestContext, input: CreateProductOptionGroupInput): Promise<Translated<ProductOptionGroup>>;
    update(ctx: RequestContext, input: UpdateProductOptionGroupInput): Promise<Translated<ProductOptionGroup>>;
}
