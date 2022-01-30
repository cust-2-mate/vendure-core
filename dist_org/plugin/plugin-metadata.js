"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDynamicModule = exports.graphQLResolversFor = exports.getConfigurationFunction = exports.getPluginModules = exports.getPluginAPIExtensions = exports.getModuleMetadata = exports.getEntitiesFromPlugins = exports.PLUGIN_METADATA = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
exports.PLUGIN_METADATA = {
    CONFIGURATION: 'configuration',
    SHOP_API_EXTENSIONS: 'shopApiExtensions',
    ADMIN_API_EXTENSIONS: 'adminApiExtensions',
    ENTITIES: 'entities',
};
function getEntitiesFromPlugins(plugins) {
    if (!plugins) {
        return [];
    }
    return plugins
        .map(p => reflectMetadata(p, exports.PLUGIN_METADATA.ENTITIES))
        .reduce((all, entities) => {
        const resolvedEntities = typeof entities === 'function' ? entities() : entities !== null && entities !== void 0 ? entities : [];
        return [...all, ...resolvedEntities];
    }, []);
}
exports.getEntitiesFromPlugins = getEntitiesFromPlugins;
function getModuleMetadata(module) {
    return {
        controllers: Reflect.getMetadata(constants_1.MODULE_METADATA.CONTROLLERS, module) || [],
        providers: Reflect.getMetadata(constants_1.MODULE_METADATA.PROVIDERS, module) || [],
        imports: Reflect.getMetadata(constants_1.MODULE_METADATA.IMPORTS, module) || [],
        exports: Reflect.getMetadata(constants_1.MODULE_METADATA.EXPORTS, module) || [],
    };
}
exports.getModuleMetadata = getModuleMetadata;
function getPluginAPIExtensions(plugins, apiType) {
    const extensions = apiType === 'shop'
        ? plugins.map(p => reflectMetadata(p, exports.PLUGIN_METADATA.SHOP_API_EXTENSIONS))
        : plugins.map(p => reflectMetadata(p, exports.PLUGIN_METADATA.ADMIN_API_EXTENSIONS));
    return extensions.filter(shared_utils_1.notNullOrUndefined);
}
exports.getPluginAPIExtensions = getPluginAPIExtensions;
function getPluginModules(plugins) {
    return plugins.map(p => (isDynamicModule(p) ? p.module : p));
}
exports.getPluginModules = getPluginModules;
function getConfigurationFunction(plugin) {
    return reflectMetadata(plugin, exports.PLUGIN_METADATA.CONFIGURATION);
}
exports.getConfigurationFunction = getConfigurationFunction;
function graphQLResolversFor(plugin, apiType) {
    const apiExtensions = apiType === 'shop'
        ? reflectMetadata(plugin, exports.PLUGIN_METADATA.SHOP_API_EXTENSIONS)
        : reflectMetadata(plugin, exports.PLUGIN_METADATA.ADMIN_API_EXTENSIONS);
    return apiExtensions
        ? typeof apiExtensions.resolvers === 'function'
            ? apiExtensions.resolvers()
            : apiExtensions.resolvers
        : [];
}
exports.graphQLResolversFor = graphQLResolversFor;
function reflectMetadata(metatype, metadataKey) {
    if (isDynamicModule(metatype)) {
        return Reflect.getMetadata(metadataKey, metatype.module);
    }
    else {
        return Reflect.getMetadata(metadataKey, metatype);
    }
}
function isDynamicModule(input) {
    return !!input.module;
}
exports.isDynamicModule = isDynamicModule;
//# sourceMappingURL=plugin-metadata.js.map