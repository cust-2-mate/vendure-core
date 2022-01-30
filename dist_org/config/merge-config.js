"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeConfig = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const simple_deep_clone_1 = require("@vendure/common/lib/simple-deep-clone");
/**
 * @description
 * Performs a deep merge of two VendureConfig objects. Unlike `Object.assign()` the `target` object is
 * not mutated, instead the function returns a new object which is the result of deeply merging the
 * values of `source` into `target`.
 *
 * @example
 * ```TypeScript
 * const result = mergeConfig(defaultConfig, {
 *   assetOptions: {
 *     uploadMaxFileSize: 5000,
 *   },
 * };
 * ```
 *
 * @docsCategory configuration
 */
function mergeConfig(target, source, depth = 0) {
    if (!source) {
        return target;
    }
    if (depth === 0) {
        target = simple_deep_clone_1.simpleDeepClone(target);
    }
    if (shared_utils_1.isObject(target) && shared_utils_1.isObject(source)) {
        for (const key in source) {
            if (shared_utils_1.isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                if (!shared_utils_1.isClassInstance(source[key])) {
                    mergeConfig(target[key], source[key], depth + 1);
                }
                else {
                    target[key] = source[key];
                }
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return target;
}
exports.mergeConfig = mergeConfig;
//# sourceMappingURL=merge-config.js.map