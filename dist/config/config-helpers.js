"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.setConfig = void 0;
const default_config_1 = require("./default-config");
const merge_config_1 = require("./merge-config");
let activeConfig = default_config_1.defaultConfig;
/**
 * Override the default config by merging in the supplied values. Should only be used prior to
 * bootstrapping the app.
 */
function setConfig(userConfig) {
    activeConfig = merge_config_1.mergeConfig(activeConfig, userConfig);
}
exports.setConfig = setConfig;
/**
 * Returns the app config object. In general this function should only be
 * used before bootstrapping the app. In all other contexts, the {@link ConfigService}
 * should be used to access config settings.
 */
function getConfig() {
    return activeConfig;
}
exports.getConfig = getConfig;
//# sourceMappingURL=config-helpers.js.map