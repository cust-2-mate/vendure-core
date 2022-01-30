"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreEntitiesMap = void 0;
const address_entity_1 = require("./address/address.entity");
const administrator_entity_1 = require("./administrator/administrator.entity");
const asset_entity_1 = require("./asset/asset.entity");
const authentication_method_entity_1 = require("./authentication-method/authentication-method.entity");
const external_authentication_method_entity_1 = require("./authentication-method/external-authentication-method.entity");
const native_authentication_method_entity_1 = require("./authentication-method/native-authentication-method.entity");
const channel_entity_1 = require("./channel/channel.entity");
const collection_asset_entity_1 = require("./collection/collection-asset.entity");
const collection_translation_entity_1 = require("./collection/collection-translation.entity");
const collection_entity_1 = require("./collection/collection.entity");
const country_translation_entity_1 = require("./country/country-translation.entity");
const country_entity_1 = require("./country/country.entity");
const customer_group_entity_1 = require("./customer-group/customer-group.entity");
const customer_entity_1 = require("./customer/customer.entity");
const facet_value_translation_entity_1 = require("./facet-value/facet-value-translation.entity");
const facet_value_entity_1 = require("./facet-value/facet-value.entity");
const facet_translation_entity_1 = require("./facet/facet-translation.entity");
const facet_entity_1 = require("./facet/facet.entity");
const fulfillment_entity_1 = require("./fulfillment/fulfillment.entity");
const global_settings_entity_1 = require("./global-settings/global-settings.entity");
const customer_history_entry_entity_1 = require("./history-entry/customer-history-entry.entity");
const history_entry_entity_1 = require("./history-entry/history-entry.entity");
const order_history_entry_entity_1 = require("./history-entry/order-history-entry.entity");
const order_item_entity_1 = require("./order-item/order-item.entity");
const order_line_entity_1 = require("./order-line/order-line.entity");
const order_modification_entity_1 = require("./order-modification/order-modification.entity");
const order_entity_1 = require("./order/order.entity");
const payment_method_entity_1 = require("./payment-method/payment-method.entity");
const payment_entity_1 = require("./payment/payment.entity");
const product_option_group_translation_entity_1 = require("./product-option-group/product-option-group-translation.entity");
const product_option_group_entity_1 = require("./product-option-group/product-option-group.entity");
const product_option_translation_entity_1 = require("./product-option/product-option-translation.entity");
const product_option_entity_1 = require("./product-option/product-option.entity");
const product_variant_asset_entity_1 = require("./product-variant/product-variant-asset.entity");
const product_variant_price_entity_1 = require("./product-variant/product-variant-price.entity");
const product_variant_translation_entity_1 = require("./product-variant/product-variant-translation.entity");
const product_variant_entity_1 = require("./product-variant/product-variant.entity");
const product_asset_entity_1 = require("./product/product-asset.entity");
const product_translation_entity_1 = require("./product/product-translation.entity");
const product_entity_1 = require("./product/product.entity");
const promotion_entity_1 = require("./promotion/promotion.entity");
const refund_entity_1 = require("./refund/refund.entity");
const role_entity_1 = require("./role/role.entity");
const anonymous_session_entity_1 = require("./session/anonymous-session.entity");
const authenticated_session_entity_1 = require("./session/authenticated-session.entity");
const session_entity_1 = require("./session/session.entity");
const shipping_line_entity_1 = require("./shipping-line/shipping-line.entity");
const shipping_method_translation_entity_1 = require("./shipping-method/shipping-method-translation.entity");
const shipping_method_entity_1 = require("./shipping-method/shipping-method.entity");
const allocation_entity_1 = require("./stock-movement/allocation.entity");
const cancellation_entity_1 = require("./stock-movement/cancellation.entity");
const release_entity_1 = require("./stock-movement/release.entity");
const sale_entity_1 = require("./stock-movement/sale.entity");
const stock_adjustment_entity_1 = require("./stock-movement/stock-adjustment.entity");
const stock_movement_entity_1 = require("./stock-movement/stock-movement.entity");
const surcharge_entity_1 = require("./surcharge/surcharge.entity");
const tag_entity_1 = require("./tag/tag.entity");
const tax_category_entity_1 = require("./tax-category/tax-category.entity");
const tax_rate_entity_1 = require("./tax-rate/tax-rate.entity");
const user_entity_1 = require("./user/user.entity");
const zone_entity_1 = require("./zone/zone.entity");
/**
 * A map of all the core database entities.
 */
exports.coreEntitiesMap = {
    Address: address_entity_1.Address,
    Administrator: administrator_entity_1.Administrator,
    Allocation: allocation_entity_1.Allocation,
    AnonymousSession: anonymous_session_entity_1.AnonymousSession,
    Asset: asset_entity_1.Asset,
    AuthenticatedSession: authenticated_session_entity_1.AuthenticatedSession,
    AuthenticationMethod: authentication_method_entity_1.AuthenticationMethod,
    Cancellation: cancellation_entity_1.Cancellation,
    Channel: channel_entity_1.Channel,
    Collection: collection_entity_1.Collection,
    CollectionAsset: collection_asset_entity_1.CollectionAsset,
    CollectionTranslation: collection_translation_entity_1.CollectionTranslation,
    Country: country_entity_1.Country,
    CountryTranslation: country_translation_entity_1.CountryTranslation,
    Customer: customer_entity_1.Customer,
    CustomerGroup: customer_group_entity_1.CustomerGroup,
    CustomerHistoryEntry: customer_history_entry_entity_1.CustomerHistoryEntry,
    ExternalAuthenticationMethod: external_authentication_method_entity_1.ExternalAuthenticationMethod,
    Facet: facet_entity_1.Facet,
    FacetTranslation: facet_translation_entity_1.FacetTranslation,
    FacetValue: facet_value_entity_1.FacetValue,
    FacetValueTranslation: facet_value_translation_entity_1.FacetValueTranslation,
    Fulfillment: fulfillment_entity_1.Fulfillment,
    GlobalSettings: global_settings_entity_1.GlobalSettings,
    HistoryEntry: history_entry_entity_1.HistoryEntry,
    NativeAuthenticationMethod: native_authentication_method_entity_1.NativeAuthenticationMethod,
    Order: order_entity_1.Order,
    OrderHistoryEntry: order_history_entry_entity_1.OrderHistoryEntry,
    OrderItem: order_item_entity_1.OrderItem,
    OrderLine: order_line_entity_1.OrderLine,
    OrderModification: order_modification_entity_1.OrderModification,
    Payment: payment_entity_1.Payment,
    PaymentMethod: payment_method_entity_1.PaymentMethod,
    Product: product_entity_1.Product,
    ProductAsset: product_asset_entity_1.ProductAsset,
    ProductOption: product_option_entity_1.ProductOption,
    ProductOptionGroup: product_option_group_entity_1.ProductOptionGroup,
    ProductOptionGroupTranslation: product_option_group_translation_entity_1.ProductOptionGroupTranslation,
    ProductOptionTranslation: product_option_translation_entity_1.ProductOptionTranslation,
    ProductTranslation: product_translation_entity_1.ProductTranslation,
    ProductVariant: product_variant_entity_1.ProductVariant,
    ProductVariantAsset: product_variant_asset_entity_1.ProductVariantAsset,
    ProductVariantPrice: product_variant_price_entity_1.ProductVariantPrice,
    ProductVariantTranslation: product_variant_translation_entity_1.ProductVariantTranslation,
    Promotion: promotion_entity_1.Promotion,
    Refund: refund_entity_1.Refund,
    Release: release_entity_1.Release,
    Role: role_entity_1.Role,
    Sale: sale_entity_1.Sale,
    Session: session_entity_1.Session,
    ShippingLine: shipping_line_entity_1.ShippingLine,
    ShippingMethod: shipping_method_entity_1.ShippingMethod,
    ShippingMethodTranslation: shipping_method_translation_entity_1.ShippingMethodTranslation,
    StockAdjustment: stock_adjustment_entity_1.StockAdjustment,
    StockMovement: stock_movement_entity_1.StockMovement,
    Surcharge: surcharge_entity_1.Surcharge,
    Tag: tag_entity_1.Tag,
    TaxCategory: tax_category_entity_1.TaxCategory,
    TaxRate: tax_rate_entity_1.TaxRate,
    User: user_entity_1.User,
    Zone: zone_entity_1.Zone,
};
//# sourceMappingURL=entities.js.map