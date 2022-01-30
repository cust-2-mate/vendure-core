"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEntities = exports.preBootstrapConfig = exports.bootstrapWorker = exports.bootstrap = void 0;
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const cookieSession = require("cookie-session");
const errors_1 = require("./common/error/errors");
const config_helpers_1 = require("./config/config-helpers");
const default_logger_1 = require("./config/logger/default-logger");
const vendure_logger_1 = require("./config/logger/vendure-logger");
const administrator_entity_1 = require("./entity/administrator/administrator.entity");
const entities_1 = require("./entity/entities");
const register_custom_entity_fields_1 = require("./entity/register-custom-entity-fields");
const set_entity_id_strategy_1 = require("./entity/set-entity-id-strategy");
const validate_custom_fields_config_1 = require("./entity/validate-custom-fields-config");
const plugin_metadata_1 = require("./plugin/plugin-metadata");
const plugin_utils_1 = require("./plugin/plugin-utils");
const process_context_1 = require("./process-context/process-context");
const vendure_worker_1 = require("./worker/vendure-worker");
/**
 * @description
 * Bootstraps the Vendure server. This is the entry point to the application.
 *
 * @example
 * ```TypeScript
 * import { bootstrap } from '\@vendure/core';
 * import { config } from './vendure-config';
 *
 * bootstrap(config).catch(err => {
 *     console.log(err);
 * });
 * ```
 * @docsCategory
 * */
async function bootstrap(userConfig) {
    const config = await preBootstrapConfig(userConfig);
    vendure_logger_1.Logger.useLogger(config.logger);
    vendure_logger_1.Logger.info(`Bootstrapping Vendure Server (pid: ${process.pid})...`);
    // The AppModule *must* be loaded only after the entities have been set in the
    // config, so that they are available when the AppModule decorator is evaluated.
    // tslint:disable-next-line:whitespace
    const appModule = await Promise.resolve().then(() => __importStar(require('./app.module')));
    process_context_1.setProcessContext('server');
    const { hostname, port, cors, middleware } = config.apiOptions;
    default_logger_1.DefaultLogger.hideNestBoostrapLogs();
    const app = await core_1.NestFactory.create(appModule.AppModule, {
        cors,
        logger: new vendure_logger_1.Logger(),
    });
    default_logger_1.DefaultLogger.restoreOriginalLogLevel();
    app.useLogger(new vendure_logger_1.Logger());
    const { tokenMethod } = config.authOptions;
    const usingCookie = tokenMethod === 'cookie' || (Array.isArray(tokenMethod) && tokenMethod.includes('cookie'));
    if (usingCookie) {
        const { cookieOptions } = config.authOptions;
        app.use(cookieSession(cookieOptions));
    }
    const earlyMiddlewares = middleware.filter(mid => mid.beforeListen);
    earlyMiddlewares.forEach(mid => {
        app.use(mid.route, mid.handler);
    });
    await app.listen(port, hostname || '');
    app.enableShutdownHooks();
    logWelcomeMessage(config);
    return app;
}
exports.bootstrap = bootstrap;
/**
 * @description
 * Bootstraps a Vendure worker. Resolves to a {@link VendureWorker} object containing a reference to the underlying
 * NestJs [standalone application](https://docs.nestjs.com/standalone-applications) as well as convenience
 * methods for starting the job queue and health check server.
 *
 * Read more about the [Vendure Worker]({{< relref "vendure-worker" >}}).
 *
 * @example
 * ```TypeScript
 * import { bootstrapWorker } from '\@vendure/core';
 * import { config } from './vendure-config';
 *
 * bootstrapWorker(config)
 *   .then(worker => worker.startJobQueue())
 *   .then(worker => worker.startHealthCheckServer({ port: 3020 }))
 *   .catch(err => {
 *     console.log(err);
 *   });
 * ```
 * @docsCategory worker
 * */
async function bootstrapWorker(userConfig) {
    const vendureConfig = await preBootstrapConfig(userConfig);
    const config = disableSynchronize(vendureConfig);
    if (config.logger instanceof default_logger_1.DefaultLogger) {
        config.logger.setDefaultContext('Vendure Worker');
    }
    vendure_logger_1.Logger.useLogger(config.logger);
    vendure_logger_1.Logger.info(`Bootstrapping Vendure Worker (pid: ${process.pid})...`);
    process_context_1.setProcessContext('worker');
    default_logger_1.DefaultLogger.hideNestBoostrapLogs();
    const WorkerModule = await Promise.resolve().then(() => __importStar(require('./worker/worker.module'))).then(m => m.WorkerModule);
    const workerApp = await core_1.NestFactory.createApplicationContext(WorkerModule, {
        logger: new vendure_logger_1.Logger(),
    });
    default_logger_1.DefaultLogger.restoreOriginalLogLevel();
    workerApp.useLogger(new vendure_logger_1.Logger());
    workerApp.enableShutdownHooks();
    await validateDbTablesForWorker(workerApp);
    vendure_logger_1.Logger.info('Vendure Worker is ready');
    return new vendure_worker_1.VendureWorker(workerApp);
}
exports.bootstrapWorker = bootstrapWorker;
/**
 * Setting the global config must be done prior to loading the AppModule.
 */
async function preBootstrapConfig(userConfig) {
    var _a;
    if (userConfig) {
        config_helpers_1.setConfig(userConfig);
    }
    const entities = await getAllEntities(userConfig);
    const { coreSubscribersMap } = await Promise.resolve().then(() => __importStar(require('./entity/subscribers')));
    config_helpers_1.setConfig({
        dbConnectionOptions: {
            entities,
            subscribers: Object.values(coreSubscribersMap),
        },
    });
    let config = config_helpers_1.getConfig();
    const entityIdStrategy = (_a = config.entityOptions.entityIdStrategy) !== null && _a !== void 0 ? _a : config.entityIdStrategy;
    set_entity_id_strategy_1.setEntityIdStrategy(entityIdStrategy, entities);
    const customFieldValidationResult = validate_custom_fields_config_1.validateCustomFieldsConfig(config.customFields, entities);
    if (!customFieldValidationResult.valid) {
        process.exitCode = 1;
        throw new Error(`CustomFields config error:\n- ` + customFieldValidationResult.errors.join('\n- '));
    }
    config = await runPluginConfigurations(config);
    register_custom_entity_fields_1.registerCustomEntityFields(config);
    setExposedHeaders(config);
    return config;
}
exports.preBootstrapConfig = preBootstrapConfig;
/**
 * Initialize any configured plugins.
 */
async function runPluginConfigurations(config) {
    for (const plugin of config.plugins) {
        const configFn = plugin_metadata_1.getConfigurationFunction(plugin);
        if (typeof configFn === 'function') {
            config = await configFn(config);
        }
    }
    return config;
}
/**
 * Returns an array of core entities and any additional entities defined in plugins.
 */
async function getAllEntities(userConfig) {
    const coreEntities = Object.values(entities_1.coreEntitiesMap);
    const pluginEntities = plugin_metadata_1.getEntitiesFromPlugins(userConfig.plugins);
    const allEntities = coreEntities;
    // Check to ensure that no plugins are defining entities with names
    // which conflict with existing entities.
    for (const pluginEntity of pluginEntities) {
        if (allEntities.find(e => e.name === pluginEntity.name)) {
            throw new errors_1.InternalServerError(`error.entity-name-conflict`, { entityName: pluginEntity.name });
        }
        else {
            allEntities.push(pluginEntity);
        }
    }
    return allEntities;
}
exports.getAllEntities = getAllEntities;
/**
 * If the 'bearer' tokenMethod is being used, then we automatically expose the authTokenHeaderKey header
 * in the CORS options, making sure to preserve any user-configured exposedHeaders.
 */
function setExposedHeaders(config) {
    const { tokenMethod } = config.authOptions;
    const isUsingBearerToken = tokenMethod === 'bearer' || (Array.isArray(tokenMethod) && tokenMethod.includes('bearer'));
    if (isUsingBearerToken) {
        const authTokenHeaderKey = config.authOptions.authTokenHeaderKey;
        const corsOptions = config.apiOptions.cors;
        if (typeof corsOptions !== 'boolean') {
            const { exposedHeaders } = corsOptions;
            let exposedHeadersWithAuthKey;
            if (!exposedHeaders) {
                exposedHeadersWithAuthKey = [authTokenHeaderKey];
            }
            else if (typeof exposedHeaders === 'string') {
                exposedHeadersWithAuthKey = exposedHeaders
                    .split(',')
                    .map(x => x.trim())
                    .concat(authTokenHeaderKey);
            }
            else {
                exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
            }
            corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
        }
    }
}
function logWelcomeMessage(config) {
    let version;
    try {
        version = require('../package.json').version;
    }
    catch (e) {
        version = ' unknown';
    }
    const { port, shopApiPath, adminApiPath, hostname } = config.apiOptions;
    const apiCliGreetings = [];
    const pathToUrl = (path) => `http://${hostname || 'localhost'}:${port}/${path}`;
    apiCliGreetings.push(['Shop API', pathToUrl(shopApiPath)]);
    apiCliGreetings.push(['Admin API', pathToUrl(adminApiPath)]);
    apiCliGreetings.push(...plugin_utils_1.getPluginStartupMessages().map(({ label, path }) => [label, pathToUrl(path)]));
    const columnarGreetings = arrangeCliGreetingsInColumns(apiCliGreetings);
    const title = `Vendure server (v${version}) now running on port ${port}`;
    const maxLineLength = Math.max(title.length, ...columnarGreetings.map(l => l.length));
    const titlePadLength = title.length < maxLineLength ? Math.floor((maxLineLength - title.length) / 2) : 0;
    vendure_logger_1.Logger.info(`=`.repeat(maxLineLength));
    vendure_logger_1.Logger.info(title.padStart(title.length + titlePadLength));
    vendure_logger_1.Logger.info('-'.repeat(maxLineLength).padStart(titlePadLength));
    columnarGreetings.forEach(line => vendure_logger_1.Logger.info(line));
    vendure_logger_1.Logger.info(`=`.repeat(maxLineLength));
}
function arrangeCliGreetingsInColumns(lines) {
    const columnWidth = Math.max(...lines.map(l => l[0].length)) + 2;
    return lines.map(l => `${(l[0] + ':').padEnd(columnWidth)}${l[1]}`);
}
/**
 * Fix race condition when modifying DB
 * See: https://github.com/vendure-ecommerce/vendure/issues/152
 */
function disableSynchronize(userConfig) {
    const config = Object.assign({}, userConfig);
    config.dbConnectionOptions = Object.assign(Object.assign({}, userConfig.dbConnectionOptions), { synchronize: false });
    return config;
}
/**
 * Check that the Database tables exist. When running Vendure server & worker
 * concurrently for the first time, the worker will attempt to access the
 * DB tables before the server has populated them (assuming synchronize = true
 * in config). This method will use polling to check the existence of a known table
 * before allowing the rest of the worker bootstrap to continue.
 * @param worker
 */
async function validateDbTablesForWorker(worker) {
    const connection = worker.get(typeorm_1.getConnectionToken());
    await new Promise(async (resolve, reject) => {
        const checkForTables = async () => {
            try {
                const adminCount = await connection.getRepository(administrator_entity_1.Administrator).count();
                return 0 < adminCount;
            }
            catch (e) {
                return false;
            }
        };
        const pollIntervalMs = 5000;
        let attempts = 0;
        const maxAttempts = 10;
        let validTableStructure = false;
        vendure_logger_1.Logger.verbose('Checking for expected DB table structure...');
        while (!validTableStructure && attempts < maxAttempts) {
            attempts++;
            validTableStructure = await checkForTables();
            if (validTableStructure) {
                vendure_logger_1.Logger.verbose('Table structure verified');
                resolve();
                return;
            }
            vendure_logger_1.Logger.verbose(`Table structure could not be verified, trying again after ${pollIntervalMs}ms (attempt ${attempts} of ${maxAttempts})`);
            await new Promise(resolve1 => setTimeout(resolve1, pollIntervalMs));
        }
        reject(`Could not validate DB table structure. Aborting bootstrap.`);
    });
}
//# sourceMappingURL=bootstrap.js.map