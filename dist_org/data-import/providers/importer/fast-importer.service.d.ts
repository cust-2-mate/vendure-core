import { CreateProductInput, CreateProductOptionGroupInput, CreateProductOptionInput, CreateProductVariantInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { TranslatableSaver } from '../../../service/helpers/translatable-saver/translatable-saver';
import { ChannelService } from '../../../service/services/channel.service';
import { StockMovementService } from '../../../service/services/stock-movement.service';
import { TransactionalConnection } from '../../../service/transaction/transactional-connection';
/**
 * A service to import entities into the database. This replaces the regular `create` methods of the service layer with faster
 * versions which skip much of the defensive checks and other DB calls which are not needed when running an import.
 *
 * In testing, the use of the FastImporterService approximately doubled the speed of bulk imports.
 */
export declare class FastImporterService {
    private connection;
    private channelService;
    private stockMovementService;
    private translatableSaver;
    private defaultChannel;
    constructor(connection: TransactionalConnection, channelService: ChannelService, stockMovementService: StockMovementService, translatableSaver: TranslatableSaver);
    initialize(): Promise<void>;
    createProduct(input: CreateProductInput): Promise<ID>;
    createProductOptionGroup(input: CreateProductOptionGroupInput): Promise<ID>;
    createProductOption(input: CreateProductOptionInput): Promise<ID>;
    addOptionGroupToProduct(productId: ID, optionGroupId: ID): Promise<void>;
    createProductVariant(input: CreateProductVariantInput): Promise<ID>;
}
