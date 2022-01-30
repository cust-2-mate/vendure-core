"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_constants_1 = require("@vendure/common/lib/shared-constants");
const in_memory_job_queue_strategy_1 = require("../job-queue/in-memory-job-queue-strategy");
const in_memory_job_buffer_storage_strategy_1 = require("../job-queue/job-buffer/in-memory-job-buffer-storage-strategy");
const default_asset_naming_strategy_1 = require("./asset-naming-strategy/default-asset-naming-strategy");
const no_asset_preview_strategy_1 = require("./asset-preview-strategy/no-asset-preview-strategy");
const no_asset_storage_strategy_1 = require("./asset-storage-strategy/no-asset-storage-strategy");
const bcrypt_password_hashing_strategy_1 = require("./auth/bcrypt-password-hashing-strategy");
const native_authentication_strategy_1 = require("./auth/native-authentication-strategy");
const default_collection_filters_1 = require("./catalog/default-collection-filters");
const default_product_variant_price_calculation_strategy_1 = require("./catalog/default-product-variant-price-calculation-strategy");
const default_stock_display_strategy_1 = require("./catalog/default-stock-display-strategy");
const auto_increment_id_strategy_1 = require("./entity-id-strategy/auto-increment-id-strategy");
const manual_fulfillment_handler_1 = require("./fulfillment/manual-fulfillment-handler");
const default_logger_1 = require("./logger/default-logger");
const default_changed_price_handling_strategy_1 = require("./order/default-changed-price-handling-strategy");
const default_order_item_price_calculation_strategy_1 = require("./order/default-order-item-price-calculation-strategy");
const default_order_placed_strategy_1 = require("./order/default-order-placed-strategy");
const default_stock_allocation_strategy_1 = require("./order/default-stock-allocation-strategy");
const merge_orders_strategy_1 = require("./order/merge-orders-strategy");
const order_by_code_access_strategy_1 = require("./order/order-by-code-access-strategy");
const order_code_strategy_1 = require("./order/order-code-strategy");
const use_guest_strategy_1 = require("./order/use-guest-strategy");
const promotion_1 = require("./promotion");
const in_memory_session_cache_strategy_1 = require("./session-cache/in-memory-session-cache-strategy");
const default_shipping_calculator_1 = require("./shipping-method/default-shipping-calculator");
const default_shipping_eligibility_checker_1 = require("./shipping-method/default-shipping-eligibility-checker");
const default_tax_line_calculation_strategy_1 = require("./tax/default-tax-line-calculation-strategy");
const default_tax_zone_strategy_1 = require("./tax/default-tax-zone-strategy");
/**
 * @description
 * The default configuration settings which are used if not explicitly overridden in the bootstrap() call.
 *
 * @docsCategory configuration
 */
exports.defaultConfig = {
    defaultChannelToken: null,
    defaultLanguageCode: generated_types_1.LanguageCode.en,
    logger: new default_logger_1.DefaultLogger(),
    apiOptions: {
        hostname: '',
        port: 3000,
        adminApiPath: 'admin-api',
        adminApiPlayground: false,
        adminApiDebug: false,
        adminListQueryLimit: 1000,
        adminApiValidationRules: [],
        shopApiPath: 'shop-api',
        shopApiPlayground: false,
        shopApiDebug: false,
        shopListQueryLimit: 100,
        shopApiValidationRules: [],
        channelTokenKey: 'vendure-token',
        cors: {
            origin: true,
            credentials: true,
        },
        middleware: [],
        apolloServerPlugins: [],
    },
    authOptions: {
        disableAuth: false,
        tokenMethod: 'cookie',
        cookieOptions: {
            secret: Math.random().toString(36).substr(3),
            httpOnly: true,
        },
        authTokenHeaderKey: shared_constants_1.DEFAULT_AUTH_TOKEN_HEADER_KEY,
        sessionDuration: '1y',
        sessionCacheStrategy: new in_memory_session_cache_strategy_1.InMemorySessionCacheStrategy(),
        sessionCacheTTL: 300,
        requireVerification: true,
        verificationTokenDuration: '7d',
        superadminCredentials: {
            identifier: shared_constants_1.SUPER_ADMIN_USER_IDENTIFIER,
            password: shared_constants_1.SUPER_ADMIN_USER_PASSWORD,
        },
        shopAuthenticationStrategy: [new native_authentication_strategy_1.NativeAuthenticationStrategy()],
        adminAuthenticationStrategy: [new native_authentication_strategy_1.NativeAuthenticationStrategy()],
        customPermissions: [],
        passwordHashingStrategy: new bcrypt_password_hashing_strategy_1.BcryptPasswordHashingStrategy(),
    },
    catalogOptions: {
        collectionFilters: default_collection_filters_1.defaultCollectionFilters,
        productVariantPriceCalculationStrategy: new default_product_variant_price_calculation_strategy_1.DefaultProductVariantPriceCalculationStrategy(),
        stockDisplayStrategy: new default_stock_display_strategy_1.DefaultStockDisplayStrategy(),
    },
    entityIdStrategy: new auto_increment_id_strategy_1.AutoIncrementIdStrategy(),
    assetOptions: {
        assetNamingStrategy: new default_asset_naming_strategy_1.DefaultAssetNamingStrategy(),
        assetStorageStrategy: new no_asset_storage_strategy_1.NoAssetStorageStrategy(),
        assetPreviewStrategy: new no_asset_preview_strategy_1.NoAssetPreviewStrategy(),
        permittedFileTypes: ['image/*', 'video/*', 'audio/*', '.pdf'],
        uploadMaxFileSize: 20971520,
    },
    dbConnectionOptions: {
        timezone: 'Z',
        type: 'mysql',
    },
    entityOptions: {
        channelCacheTtl: 30000,
        zoneCacheTtl: 30000,
    },
    promotionOptions: {
        promotionConditions: promotion_1.defaultPromotionConditions,
        promotionActions: promotion_1.defaultPromotionActions,
    },
    shippingOptions: {
        shippingEligibilityCheckers: [default_shipping_eligibility_checker_1.defaultShippingEligibilityChecker],
        shippingCalculators: [default_shipping_calculator_1.defaultShippingCalculator],
        customFulfillmentProcess: [],
        fulfillmentHandlers: [manual_fulfillment_handler_1.manualFulfillmentHandler],
    },
    orderOptions: {
        orderItemsLimit: 999,
        orderLineItemsLimit: 999,
        orderItemPriceCalculationStrategy: new default_order_item_price_calculation_strategy_1.DefaultOrderItemPriceCalculationStrategy(),
        mergeStrategy: new merge_orders_strategy_1.MergeOrdersStrategy(),
        checkoutMergeStrategy: new use_guest_strategy_1.UseGuestStrategy(),
        process: [],
        stockAllocationStrategy: new default_stock_allocation_strategy_1.DefaultStockAllocationStrategy(),
        orderCodeStrategy: new order_code_strategy_1.DefaultOrderCodeStrategy(),
        orderByCodeAccessStrategy: new order_by_code_access_strategy_1.DefaultOrderByCodeAccessStrategy('2h'),
        changedPriceHandlingStrategy: new default_changed_price_handling_strategy_1.DefaultChangedPriceHandlingStrategy(),
        orderPlacedStrategy: new default_order_placed_strategy_1.DefaultOrderPlacedStrategy(),
    },
    paymentOptions: {
        paymentMethodEligibilityCheckers: [],
        paymentMethodHandlers: [],
        customPaymentProcess: [],
    },
    taxOptions: {
        taxZoneStrategy: new default_tax_zone_strategy_1.DefaultTaxZoneStrategy(),
        taxLineCalculationStrategy: new default_tax_line_calculation_strategy_1.DefaultTaxLineCalculationStrategy(),
    },
    importExportOptions: {
        importAssetsDir: __dirname,
    },
    jobQueueOptions: {
        jobQueueStrategy: new in_memory_job_queue_strategy_1.InMemoryJobQueueStrategy(),
        jobBufferStorageStrategy: new in_memory_job_buffer_storage_strategy_1.InMemoryJobBufferStorageStrategy(),
        activeQueues: [],
        enableWorkerHealthCheck: false,
    },
    customFields: {
        Address: [],
        Administrator: [],
        Asset: [],
        Channel: [],
        Collection: [],
        Country: [],
        Customer: [],
        CustomerGroup: [],
        Facet: [],
        FacetValue: [],
        Fulfillment: [],
        GlobalSettings: [],
        Order: [],
        OrderLine: [],
        PaymentMethod: [],
        Product: [],
        ProductOption: [],
        ProductOptionGroup: [],
        ProductVariant: [],
        Promotion: [],
        ShippingMethod: [],
        TaxCategory: [],
        TaxRate: [],
        User: [],
        Zone: [],
    },
    plugins: [],
};
//# sourceMappingURL=default-config.js.map