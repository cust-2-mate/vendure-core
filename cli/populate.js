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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProductsFromCsv = exports.populateCollections = exports.populateInitialData = exports.populate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const cli_utils_1 = require("./cli-utils");
async function populate(bootstrapFn, initialDataPathOrObject, productsCsvPath) {
    const app = await bootstrapFn();
    if (!app) {
        throw new Error('Could not bootstrap the Vendure app');
    }
    const initialData = typeof initialDataPathOrObject === 'string'
        ? require(initialDataPathOrObject)
        : initialDataPathOrObject;
    await populateInitialData(app, initialData, cli_utils_1.logColored);
    if (productsCsvPath) {
        const importResult = await importProductsFromCsv(app, productsCsvPath, initialData.defaultLanguage);
        if (importResult.errors && importResult.errors.length) {
            const errorFile = path_1.default.join(process.cwd(), 'vendure-import-error.log');
            console.log(`${importResult.errors.length} errors encountered when importing product data. See: ${errorFile}`);
            await fs_extra_1.default.writeFile(errorFile, importResult.errors.join('\n'));
        }
        cli_utils_1.logColored(`\nImported ${importResult.imported} products`);
        await populateCollections(app, initialData, cli_utils_1.logColored);
    }
    cli_utils_1.logColored('\nDone!');
    return app;
}
exports.populate = populate;
async function populateInitialData(app, initialData, loggingFn) {
    const { Populator } = await Promise.resolve().then(() => __importStar(require('@vendure/core')));
    const populator = app.get(Populator);
    try {
        await populator.populateInitialData(initialData);
        if (typeof loggingFn === 'function') {
            loggingFn(`Populated initial data`);
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.populateInitialData = populateInitialData;
async function populateCollections(app, initialData, loggingFn) {
    const { Populator } = await Promise.resolve().then(() => __importStar(require('@vendure/core')));
    const populator = app.get(Populator);
    try {
        if (initialData.collections.length) {
            await populator.populateCollections(initialData);
            if (typeof loggingFn === 'function') {
                loggingFn(`Created ${initialData.collections.length} Collections`);
            }
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.populateCollections = populateCollections;
async function importProductsFromCsv(app, productsCsvPath, languageCode) {
    const { Importer } = await Promise.resolve().then(() => __importStar(require('@vendure/core')));
    const importer = app.get(Importer);
    const productData = await fs_extra_1.default.readFile(productsCsvPath, 'utf-8');
    return importer.parseAndImport(productData, languageCode, true).toPromise();
}
exports.importProductsFromCsv = importProductsFromCsv;
//# sourceMappingURL=populate.js.map