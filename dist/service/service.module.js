"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ServiceModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceModule = exports.ServiceCoreModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_module_1 = require("../cache/cache.module");
const config_module_1 = require("../config/config.module");
const config_service_1 = require("../config/config.service");
const typeorm_logger_1 = require("../config/logger/typeorm-logger");
const event_bus_module_1 = require("../event-bus/event-bus.module");
const job_queue_module_1 = require("../job-queue/job-queue.module");
const active_order_service_1 = require("./helpers/active-order/active-order.service");
const config_arg_service_1 = require("./helpers/config-arg/config-arg.service");
const custom_field_relation_service_1 = require("./helpers/custom-field-relation/custom-field-relation.service");
const external_authentication_service_1 = require("./helpers/external-authentication/external-authentication.service");
const fulfillment_state_machine_1 = require("./helpers/fulfillment-state-machine/fulfillment-state-machine");
const list_query_builder_1 = require("./helpers/list-query-builder/list-query-builder");
const locale_string_hydrator_1 = require("./helpers/locale-string-hydrator/locale-string-hydrator");
const order_calculator_1 = require("./helpers/order-calculator/order-calculator");
const order_merger_1 = require("./helpers/order-merger/order-merger");
const order_modifier_1 = require("./helpers/order-modifier/order-modifier");
const order_state_machine_1 = require("./helpers/order-state-machine/order-state-machine");
const password_cipher_1 = require("./helpers/password-cipher/password-cipher");
const payment_state_machine_1 = require("./helpers/payment-state-machine/payment-state-machine");
const refund_state_machine_1 = require("./helpers/refund-state-machine/refund-state-machine");
const shipping_calculator_1 = require("./helpers/shipping-calculator/shipping-calculator");
const slug_validator_1 = require("./helpers/slug-validator/slug-validator");
const translatable_saver_1 = require("./helpers/translatable-saver/translatable-saver");
const verification_token_generator_1 = require("./helpers/verification-token-generator/verification-token-generator");
const initializer_service_1 = require("./initializer.service");
const administrator_service_1 = require("./services/administrator.service");
const asset_service_1 = require("./services/asset.service");
const auth_service_1 = require("./services/auth.service");
const channel_service_1 = require("./services/channel.service");
const collection_service_1 = require("./services/collection.service");
const country_service_1 = require("./services/country.service");
const customer_group_service_1 = require("./services/customer-group.service");
const customer_service_1 = require("./services/customer.service");
const facet_value_service_1 = require("./services/facet-value.service");
const facet_service_1 = require("./services/facet.service");
const fulfillment_service_1 = require("./services/fulfillment.service");
const global_settings_service_1 = require("./services/global-settings.service");
const history_service_1 = require("./services/history.service");
const order_testing_service_1 = require("./services/order-testing.service");
const order_service_1 = require("./services/order.service");
const payment_method_service_1 = require("./services/payment-method.service");
const payment_service_1 = require("./services/payment.service");
const product_option_group_service_1 = require("./services/product-option-group.service");
const product_option_service_1 = require("./services/product-option.service");
const product_variant_service_1 = require("./services/product-variant.service");
const product_service_1 = require("./services/product.service");
const promotion_service_1 = require("./services/promotion.service");
const role_service_1 = require("./services/role.service");
const search_service_1 = require("./services/search.service");
const session_service_1 = require("./services/session.service");
const shipping_method_service_1 = require("./services/shipping-method.service");
const stock_movement_service_1 = require("./services/stock-movement.service");
const tag_service_1 = require("./services/tag.service");
const tax_category_service_1 = require("./services/tax-category.service");
const tax_rate_service_1 = require("./services/tax-rate.service");
const user_service_1 = require("./services/user.service");
const zone_service_1 = require("./services/zone.service");
const transactional_connection_1 = require("./transaction/transactional-connection");
const services = [
    administrator_service_1.AdministratorService,
    asset_service_1.AssetService,
    auth_service_1.AuthService,
    channel_service_1.ChannelService,
    collection_service_1.CollectionService,
    country_service_1.CountryService,
    customer_group_service_1.CustomerGroupService,
    customer_service_1.CustomerService,
    facet_service_1.FacetService,
    facet_value_service_1.FacetValueService,
    fulfillment_service_1.FulfillmentService,
    global_settings_service_1.GlobalSettingsService,
    history_service_1.HistoryService,
    order_service_1.OrderService,
    order_testing_service_1.OrderTestingService,
    payment_service_1.PaymentService,
    payment_method_service_1.PaymentMethodService,
    product_option_group_service_1.ProductOptionGroupService,
    product_option_service_1.ProductOptionService,
    product_service_1.ProductService,
    product_variant_service_1.ProductVariantService,
    promotion_service_1.PromotionService,
    role_service_1.RoleService,
    search_service_1.SearchService,
    session_service_1.SessionService,
    shipping_method_service_1.ShippingMethodService,
    stock_movement_service_1.StockMovementService,
    tag_service_1.TagService,
    tax_category_service_1.TaxCategoryService,
    tax_rate_service_1.TaxRateService,
    user_service_1.UserService,
    zone_service_1.ZoneService,
];
const helpers = [
    translatable_saver_1.TranslatableSaver,
    password_cipher_1.PasswordCipher,
    order_calculator_1.OrderCalculator,
    order_state_machine_1.OrderStateMachine,
    fulfillment_state_machine_1.FulfillmentStateMachine,
    order_merger_1.OrderMerger,
    order_modifier_1.OrderModifier,
    payment_state_machine_1.PaymentStateMachine,
    list_query_builder_1.ListQueryBuilder,
    shipping_calculator_1.ShippingCalculator,
    verification_token_generator_1.VerificationTokenGenerator,
    refund_state_machine_1.RefundStateMachine,
    config_arg_service_1.ConfigArgService,
    slug_validator_1.SlugValidator,
    external_authentication_service_1.ExternalAuthenticationService,
    transactional_connection_1.TransactionalConnection,
    custom_field_relation_service_1.CustomFieldRelationService,
    locale_string_hydrator_1.LocaleStringHydrator,
    active_order_service_1.ActiveOrderService,
];
let defaultTypeOrmModule;
/**
 * The ServiceCoreModule is imported internally by the ServiceModule. It is arranged in this way so that
 * there is only a single instance of this module being instantiated, and thus the lifecycle hooks will
 * only run a single time.
 */
let ServiceCoreModule = class ServiceCoreModule {
};
ServiceCoreModule = __decorate([
    common_1.Module({
        imports: [config_module_1.ConfigModule, event_bus_module_1.EventBusModule, cache_module_1.CacheModule, job_queue_module_1.JobQueueModule],
        providers: [...services, ...helpers, initializer_service_1.InitializerService],
        exports: [...services, ...helpers],
    })
], ServiceCoreModule);
exports.ServiceCoreModule = ServiceCoreModule;
/**
 * The ServiceModule is responsible for the service layer, i.e. accessing the database
 * and implementing the main business logic of the application.
 *
 * The exported providers are used in the ApiModule, which is responsible for parsing requests
 * into a format suitable for the service layer logic.
 */
let ServiceModule = ServiceModule_1 = class ServiceModule {
    static forRoot() {
        if (!defaultTypeOrmModule) {
            defaultTypeOrmModule = typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_module_1.ConfigModule],
                useFactory: (configService) => {
                    const { dbConnectionOptions } = configService;
                    const logger = ServiceModule_1.getTypeOrmLogger(dbConnectionOptions);
                    return Object.assign(Object.assign({}, dbConnectionOptions), { logger });
                },
                inject: [config_service_1.ConfigService],
            });
        }
        return {
            module: ServiceModule_1,
            imports: [defaultTypeOrmModule],
        };
    }
    static forPlugin() {
        return {
            module: ServiceModule_1,
            imports: [typeorm_1.TypeOrmModule.forFeature()],
        };
    }
    static getTypeOrmLogger(dbConnectionOptions) {
        if (!dbConnectionOptions.logger) {
            return new typeorm_logger_1.TypeOrmLogger(dbConnectionOptions.logging);
        }
        else {
            return dbConnectionOptions.logger;
        }
    }
};
ServiceModule = ServiceModule_1 = __decorate([
    common_1.Module({
        imports: [ServiceCoreModule],
        exports: [ServiceCoreModule],
    })
], ServiceModule);
exports.ServiceModule = ServiceModule;
//# sourceMappingURL=service.module.js.map