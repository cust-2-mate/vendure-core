"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamicGraphQlModulesForPlugins = exports.createDynamicGraphQlModulesForPlugins = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const config_helpers_1 = require("../config/config-helpers");
const plugin_metadata_1 = require("./plugin-metadata");
const dynamicApiModuleClassMap = {};
/**
 * This function dynamically creates a Nest module to house any GraphQL resolvers defined by
 * any configured plugins.
 */
function createDynamicGraphQlModulesForPlugins(apiType) {
    return config_helpers_1.getConfig()
        .plugins.map(plugin => {
        const pluginModule = plugin_metadata_1.isDynamicModule(plugin) ? plugin.module : plugin;
        const resolvers = plugin_metadata_1.graphQLResolversFor(plugin, apiType) || [];
        if (resolvers.length) {
            const className = dynamicClassName(pluginModule, apiType);
            dynamicApiModuleClassMap[className] = class {
            };
            Object.defineProperty(dynamicApiModuleClassMap[className], 'name', { value: className });
            const { imports } = plugin_metadata_1.getModuleMetadata(pluginModule);
            return {
                module: dynamicApiModuleClassMap[className],
                imports: [pluginModule, ...imports],
                providers: [...resolvers],
            };
        }
    })
        .filter(shared_utils_1.notNullOrUndefined);
}
exports.createDynamicGraphQlModulesForPlugins = createDynamicGraphQlModulesForPlugins;
/**
 * This function retrieves any dynamic modules which were created with createDynamicGraphQlModulesForPlugins.
 */
function getDynamicGraphQlModulesForPlugins(apiType) {
    return config_helpers_1.getConfig()
        .plugins.map(plugin => {
        const pluginModule = plugin_metadata_1.isDynamicModule(plugin) ? plugin.module : plugin;
        const resolvers = plugin_metadata_1.graphQLResolversFor(plugin, apiType) || [];
        const className = dynamicClassName(pluginModule, apiType);
        return dynamicApiModuleClassMap[className];
    })
        .filter(shared_utils_1.notNullOrUndefined);
}
exports.getDynamicGraphQlModulesForPlugins = getDynamicGraphQlModulesForPlugins;
function dynamicClassName(module, apiType) {
    return module.name + `Dynamic` + (apiType === 'shop' ? 'Shop' : 'Admin') + 'Module';
}
//# sourceMappingURL=dynamic-plugin-api.module.js.map