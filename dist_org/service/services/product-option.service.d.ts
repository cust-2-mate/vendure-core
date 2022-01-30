import { CreateGroupOptionInput, CreateProductOptionInput, UpdateProductOptionInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { Translated } from '../../common/types/locale-types';
import { ProductOptionGroup } from '../../entity/product-option-group/product-option-group.entity';
import { ProductOption } from '../../entity/product-option/product-option.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class ProductOptionService {
    private connection;
    private translatableSaver;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, translatableSaver: TranslatableSaver, customFieldRelationService: CustomFieldRelationService);
    findAll(ctx: RequestContext): Promise<Array<Translated<ProductOption>>>;
    findOne(ctx: RequestContext, id: ID): Promise<Translated<ProductOption> | undefined>;
    create(ctx: RequestContext, group: ProductOptionGroup | ID, input: CreateGroupOptionInput | CreateProductOptionInput): Promise<Translated<ProductOption>>;
    update(ctx: RequestContext, input: UpdateProductOptionInput): Promise<Translated<ProductOption>>;
}
