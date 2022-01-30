"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastImporterService = void 0;
const common_1 = require("@nestjs/common");
const request_context_1 = require("../../../api/common/request-context");
const transactional_connection_1 = require("../../../connection/transactional-connection");
const product_option_group_translation_entity_1 = require("../../../entity/product-option-group/product-option-group-translation.entity");
const product_option_group_entity_1 = require("../../../entity/product-option-group/product-option-group.entity");
const product_option_translation_entity_1 = require("../../../entity/product-option/product-option-translation.entity");
const product_option_entity_1 = require("../../../entity/product-option/product-option.entity");
const product_variant_asset_entity_1 = require("../../../entity/product-variant/product-variant-asset.entity");
const product_variant_price_entity_1 = require("../../../entity/product-variant/product-variant-price.entity");
const product_variant_translation_entity_1 = require("../../../entity/product-variant/product-variant-translation.entity");
const product_variant_entity_1 = require("../../../entity/product-variant/product-variant.entity");
const product_asset_entity_1 = require("../../../entity/product/product-asset.entity");
const product_translation_entity_1 = require("../../../entity/product/product-translation.entity");
const product_entity_1 = require("../../../entity/product/product.entity");
const translatable_saver_1 = require("../../../service/helpers/translatable-saver/translatable-saver");
const channel_service_1 = require("../../../service/services/channel.service");
const stock_movement_service_1 = require("../../../service/services/stock-movement.service");
/**
 * A service to import entities into the database. This replaces the regular `create` methods of the service layer with faster
 * versions which skip much of the defensive checks and other DB calls which are not needed when running an import.
 *
 * In testing, the use of the FastImporterService approximately doubled the speed of bulk imports.
 */
let FastImporterService = class FastImporterService {
    constructor(connection, channelService, stockMovementService, translatableSaver) {
        this.connection = connection;
        this.channelService = channelService;
        this.stockMovementService = stockMovementService;
        this.translatableSaver = translatableSaver;
    }
    async initialize() {
        this.defaultChannel = await this.channelService.getDefaultChannel();
    }
    async createProduct(input) {
        const product = await this.translatableSaver.create({
            ctx: request_context_1.RequestContext.empty(),
            input,
            entityType: product_entity_1.Product,
            translationType: product_translation_entity_1.ProductTranslation,
            beforeSave: async (p) => {
                p.channels = [this.defaultChannel];
                if (input.facetValueIds) {
                    p.facetValues = input.facetValueIds.map(id => ({ id }));
                }
                if (input.featuredAssetId) {
                    p.featuredAsset = { id: input.featuredAssetId };
                }
            },
        });
        if (input.assetIds) {
            const productAssets = input.assetIds.map((id, i) => new product_asset_entity_1.ProductAsset({
                assetId: id,
                productId: product.id,
                position: i,
            }));
            await this.connection.getRepository(product_asset_entity_1.ProductAsset).save(productAssets, { reload: false });
        }
        return product.id;
    }
    async createProductOptionGroup(input) {
        const group = await this.translatableSaver.create({
            ctx: request_context_1.RequestContext.empty(),
            input,
            entityType: product_option_group_entity_1.ProductOptionGroup,
            translationType: product_option_group_translation_entity_1.ProductOptionGroupTranslation,
        });
        return group.id;
    }
    async createProductOption(input) {
        const option = await this.translatableSaver.create({
            ctx: request_context_1.RequestContext.empty(),
            input,
            entityType: product_option_entity_1.ProductOption,
            translationType: product_option_translation_entity_1.ProductOptionTranslation,
            beforeSave: po => (po.group = { id: input.productOptionGroupId }),
        });
        return option.id;
    }
    async addOptionGroupToProduct(productId, optionGroupId) {
        await this.connection
            .getRepository(product_entity_1.Product)
            .createQueryBuilder()
            .relation('optionGroups')
            .of(productId)
            .add(optionGroupId);
    }
    async createProductVariant(input) {
        if (!input.optionIds) {
            input.optionIds = [];
        }
        if (input.price == null) {
            input.price = 0;
        }
        const inputWithoutPrice = Object.assign({}, input);
        delete inputWithoutPrice.price;
        const createdVariant = await this.translatableSaver.create({
            ctx: request_context_1.RequestContext.empty(),
            input: inputWithoutPrice,
            entityType: product_variant_entity_1.ProductVariant,
            translationType: product_variant_translation_entity_1.ProductVariantTranslation,
            beforeSave: async (variant) => {
                variant.channels = [this.defaultChannel];
                const { optionIds } = input;
                if (optionIds && optionIds.length) {
                    variant.options = optionIds.map(id => ({ id }));
                }
                if (input.facetValueIds) {
                    variant.facetValues = input.facetValueIds.map(id => ({ id }));
                }
                variant.product = { id: input.productId };
                variant.taxCategory = { id: input.taxCategoryId };
                if (input.featuredAssetId) {
                    variant.featuredAsset = { id: input.featuredAssetId };
                }
            },
        });
        if (input.assetIds) {
            const variantAssets = input.assetIds.map((id, i) => new product_variant_asset_entity_1.ProductVariantAsset({
                assetId: id,
                productVariantId: createdVariant.id,
                position: i,
            }));
            await this.connection.getRepository(product_variant_asset_entity_1.ProductVariantAsset).save(variantAssets, { reload: false });
        }
        if (input.stockOnHand != null && input.stockOnHand !== 0) {
            await this.stockMovementService.adjustProductVariantStock(request_context_1.RequestContext.empty(), createdVariant.id, 0, input.stockOnHand);
        }
        const variantPrice = new product_variant_price_entity_1.ProductVariantPrice({
            price: input.price,
            channelId: this.defaultChannel.id,
        });
        variantPrice.variant = createdVariant;
        await this.connection.getRepository(product_variant_price_entity_1.ProductVariantPrice).save(variantPrice, { reload: false });
        return createdVariant.id;
    }
};
FastImporterService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        channel_service_1.ChannelService,
        stock_movement_service_1.StockMovementService,
        translatable_saver_1.TranslatableSaver])
], FastImporterService);
exports.FastImporterService = FastImporterService;
//# sourceMappingURL=fast-importer.service.js.map