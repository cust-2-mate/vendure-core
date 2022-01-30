"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGraphQLModule = void 0;
const graphql_1 = require("@nestjs/graphql");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const graphql_2 = require("graphql");
const path_1 = __importDefault(require("path"));
const config_module_1 = require("../../config/config.module");
const config_service_1 = require("../../config/config.service");
const i18n_module_1 = require("../../i18n/i18n.module");
const i18n_service_1 = require("../../i18n/i18n.service");
const dynamic_plugin_api_module_1 = require("../../plugin/dynamic-plugin-api.module");
const plugin_metadata_1 = require("../../plugin/plugin-metadata");
const service_module_1 = require("../../service/service.module");
const api_internal_modules_1 = require("../api-internal-modules");
const custom_field_relation_resolver_service_1 = require("../common/custom-field-relation-resolver.service");
const id_codec_service_1 = require("../common/id-codec.service");
const asset_interceptor_plugin_1 = require("../middleware/asset-interceptor-plugin");
const id_codec_plugin_1 = require("../middleware/id-codec-plugin");
const translate_errors_plugin_1 = require("../middleware/translate-errors-plugin");
const generate_auth_types_1 = require("./generate-auth-types");
const generate_error_code_enum_1 = require("./generate-error-code-enum");
const generate_list_options_1 = require("./generate-list-options");
const generate_permissions_1 = require("./generate-permissions");
const generate_resolvers_1 = require("./generate-resolvers");
const graphql_custom_fields_1 = require("./graphql-custom-fields");
/**
 * Dynamically generates a GraphQLModule according to the given config options.
 */
function configureGraphQLModule(getOptions) {
    return graphql_1.GraphQLModule.forRootAsync({
        useFactory: (configService, i18nService, idCodecService, typesLoader, customFieldRelationResolverService) => {
            return createGraphQLOptions(i18nService, configService, idCodecService, typesLoader, customFieldRelationResolverService, getOptions(configService));
        },
        inject: [
            config_service_1.ConfigService,
            i18n_service_1.I18nService,
            id_codec_service_1.IdCodecService,
            graphql_1.GraphQLTypesLoader,
            custom_field_relation_resolver_service_1.CustomFieldRelationResolverService,
        ],
        imports: [config_module_1.ConfigModule, i18n_module_1.I18nModule, api_internal_modules_1.ApiSharedModule, service_module_1.ServiceModule],
    });
}
exports.configureGraphQLModule = configureGraphQLModule;
async function createGraphQLOptions(i18nService, configService, idCodecService, typesLoader, customFieldRelationResolverService, options) {
    const builtSchema = await buildSchemaForApi(options.apiType);
    const resolvers = generate_resolvers_1.generateResolvers(configService, customFieldRelationResolverService, options.apiType, builtSchema);
    return {
        path: '/' + options.apiPath,
        typeDefs: graphql_2.printSchema(builtSchema),
        include: [options.resolverModule, ...dynamic_plugin_api_module_1.getDynamicGraphQlModulesForPlugins(options.apiType)],
        fieldResolverEnhancers: ['guards'],
        resolvers,
        // We no longer rely on the upload facility bundled with Apollo Server, and instead
        // manually configure the graphql-upload package. See https://github.com/vendure-ecommerce/vendure/issues/396
        uploads: false,
        playground: options.playground || false,
        debug: options.debug || false,
        context: (req) => req,
        // This is handled by the Express cors plugin
        cors: false,
        plugins: [
            new id_codec_plugin_1.IdCodecPlugin(idCodecService),
            new translate_errors_plugin_1.TranslateErrorsPlugin(i18nService),
            new asset_interceptor_plugin_1.AssetInterceptorPlugin(configService),
            ...configService.apiOptions.apolloServerPlugins,
        ],
        validationRules: options.validationRules,
    };
    /**
     * Generates the server's GraphQL schema by combining:
     * 1. the default schema as defined in the source .graphql files specified by `typePaths`
     * 2. any custom fields defined in the config
     * 3. any schema extensions defined by plugins
     */
    async function buildSchemaForApi(apiType) {
        const customFields = configService.customFields;
        // Paths must be normalized to use forward-slash separators.
        // See https://github.com/nestjs/graphql/issues/336
        const normalizedPaths = options.typePaths.map(p => p.split(path_1.default.sep).join('/'));
        const typeDefs = await typesLoader.mergeTypesByPaths(normalizedPaths);
        const authStrategies = apiType === 'shop'
            ? configService.authOptions.shopAuthenticationStrategy
            : configService.authOptions.adminAuthenticationStrategy;
        let schema = graphql_2.buildSchema(typeDefs);
        plugin_metadata_1.getPluginAPIExtensions(configService.plugins, apiType)
            .map(e => (typeof e.schema === 'function' ? e.schema() : e.schema))
            .filter(shared_utils_1.notNullOrUndefined)
            .forEach(documentNode => (schema = graphql_2.extendSchema(schema, documentNode)));
        schema = generate_list_options_1.generateListOptions(schema);
        schema = graphql_custom_fields_1.addGraphQLCustomFields(schema, customFields, apiType === 'shop');
        schema = graphql_custom_fields_1.addOrderLineCustomFieldsInput(schema, customFields.OrderLine || []);
        schema = graphql_custom_fields_1.addModifyOrderCustomFields(schema, customFields.Order || []);
        schema = graphql_custom_fields_1.addShippingMethodQuoteCustomFields(schema, customFields.ShippingMethod || []);
        schema = graphql_custom_fields_1.addPaymentMethodQuoteCustomFields(schema, customFields.PaymentMethod || []);
        schema = generate_auth_types_1.generateAuthenticationTypes(schema, authStrategies);
        schema = generate_error_code_enum_1.generateErrorCodeEnum(schema);
        if (apiType === 'admin') {
            schema = graphql_custom_fields_1.addServerConfigCustomFields(schema, customFields);
            schema = graphql_custom_fields_1.addActiveAdministratorCustomFields(schema, customFields.Administrator);
        }
        if (apiType === 'shop') {
            schema = graphql_custom_fields_1.addRegisterCustomerCustomFieldsInput(schema, customFields.Customer || []);
        }
        schema = generate_permissions_1.generatePermissionEnum(schema, configService.authOptions.customPermissions);
        return schema;
    }
}
//# sourceMappingURL=configure-graphql-module.js.map