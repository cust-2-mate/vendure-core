import { AssignProductVariantsToChannelInput, CreateProductVariantInput, DeletionResponse, RemoveProductVariantsFromChannelInput, UpdateProductVariantInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { RequestContextCacheService } from '../../cache/request-context-cache.service';
import { ListQueryOptions } from '../../common/types/common-types';
import { Translated } from '../../common/types/locale-types';
import { ConfigService } from '../../config/config.service';
import { Channel, Order, ProductVariantPrice } from '../../entity';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { ProductOption } from '../../entity/product-option/product-option.entity';
import { ProductVariant } from '../../entity/product-variant/product-variant.entity';
import { Product } from '../../entity/product/product.entity';
import { EventBus } from '../../event-bus/event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TranslatableSaver } from '../helpers/translatable-saver/translatable-saver';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { AssetService } from './asset.service';
import { ChannelService } from './channel.service';
import { FacetValueService } from './facet-value.service';
import { GlobalSettingsService } from './global-settings.service';
import { RoleService } from './role.service';
import { StockMovementService } from './stock-movement.service';
import { TaxCategoryService } from './tax-category.service';
import { TaxRateService } from './tax-rate.service';
import { ZoneService } from './zone.service';
export declare class ProductVariantService {
    private connection;
    private configService;
    private taxCategoryService;
    private facetValueService;
    private taxRateService;
    private assetService;
    private zoneService;
    private translatableSaver;
    private eventBus;
    private listQueryBuilder;
    private globalSettingsService;
    private stockMovementService;
    private channelService;
    private roleService;
    private customFieldRelationService;
    private requestCache;
    constructor(connection: TransactionalConnection, configService: ConfigService, taxCategoryService: TaxCategoryService, facetValueService: FacetValueService, taxRateService: TaxRateService, assetService: AssetService, zoneService: ZoneService, translatableSaver: TranslatableSaver, eventBus: EventBus, listQueryBuilder: ListQueryBuilder, globalSettingsService: GlobalSettingsService, stockMovementService: StockMovementService, channelService: ChannelService, roleService: RoleService, customFieldRelationService: CustomFieldRelationService, requestCache: RequestContextCacheService);
    findAll(ctx: RequestContext, options?: ListQueryOptions<ProductVariant>): Promise<PaginatedList<Translated<ProductVariant>>>;
    findOne(ctx: RequestContext, productVariantId: ID): Promise<Translated<ProductVariant> | undefined>;
    findByIds(ctx: RequestContext, ids: ID[]): Promise<Array<Translated<ProductVariant>>>;
    getVariantsByProductId(ctx: RequestContext, productId: ID, options?: ListQueryOptions<ProductVariant>): Promise<PaginatedList<Translated<ProductVariant>>>;
    getVariantsByCollectionId(ctx: RequestContext, collectionId: ID, options: ListQueryOptions<ProductVariant>): Promise<PaginatedList<Translated<ProductVariant>>>;
    getProductVariantChannels(ctx: RequestContext, productVariantId: ID): Promise<Channel[]>;
    getVariantByOrderLineId(ctx: RequestContext, orderLineId: ID): Promise<Translated<ProductVariant>>;
    getOptionsForVariant(ctx: RequestContext, variantId: ID): Promise<Array<Translated<ProductOption>>>;
    getFacetValuesForVariant(ctx: RequestContext, variantId: ID): Promise<Array<Translated<FacetValue>>>;
    /**
     * Returns the Product associated with the ProductVariant. Whereas the `ProductService.findOne()`
     * method performs a large multi-table join with all the typical data needed for a "product detail"
     * page, this method returns on the Product itself.
     */
    getProductForVariant(ctx: RequestContext, variant: ProductVariant): Promise<Translated<Product>>;
    /**
     * @description
     * Returns the number of saleable units of the ProductVariant, i.e. how many are available
     * for purchase by Customers.
     */
    getSaleableStockLevel(ctx: RequestContext, variant: ProductVariant): Promise<number>;
    /**
     * @description
     * Returns the stockLevel to display to the customer, as specified by the configured
     * {@link StockDisplayStrategy}.
     */
    getDisplayStockLevel(ctx: RequestContext, variant: ProductVariant): Promise<string>;
    /**
     * @description
     * Returns the number of fulfillable units of the ProductVariant, equivalent to stockOnHand
     * for those variants which are tracking inventory.
     */
    getFulfillableStockLevel(ctx: RequestContext, variant: ProductVariant): Promise<number>;
    create(ctx: RequestContext, input: CreateProductVariantInput[]): Promise<Array<Translated<ProductVariant>>>;
    update(ctx: RequestContext, input: UpdateProductVariantInput[]): Promise<Array<Translated<ProductVariant>>>;
    private createSingle;
    private updateSingle;
    /**
     * Creates a ProductVariantPrice for the given ProductVariant/Channel combination.
     */
    createOrUpdateProductVariantPrice(ctx: RequestContext, productVariantId: ID, price: number, channelId: ID): Promise<ProductVariantPrice>;
    softDelete(ctx: RequestContext, id: ID | ID[]): Promise<DeletionResponse>;
    /**
     * This method is intended to be used by the ProductVariant GraphQL entity resolver to resolve the
     * price-related fields which need to be populated at run-time using the `applyChannelPriceAndTax`
     * method.
     *
     * Is optimized to make as few DB calls as possible using caching based on the open request.
     */
    hydratePriceFields<F extends 'currencyCode' | 'price' | 'priceWithTax' | 'taxRateApplied'>(ctx: RequestContext, variant: ProductVariant, priceField: F): Promise<ProductVariant[F]>;
    /**
     * Populates the `price` field with the price for the specified channel.
     */
    applyChannelPriceAndTax(variant: ProductVariant, ctx: RequestContext, order?: Order): Promise<ProductVariant>;
    assignProductVariantsToChannel(ctx: RequestContext, input: AssignProductVariantsToChannelInput): Promise<Array<Translated<ProductVariant>>>;
    removeProductVariantsFromChannel(ctx: RequestContext, input: RemoveProductVariantsFromChannelInput): Promise<Array<Translated<ProductVariant>>>;
    private validateVariantOptionIds;
    private throwIncompatibleOptionsError;
    private sortJoin;
    private getTaxCategoryForNewVariant;
}
