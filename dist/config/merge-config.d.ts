import { PartialVendureConfig, VendureConfig } from './vendure-config';
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
export declare function mergeConfig<T extends VendureConfig>(target: T, source: PartialVendureConfig, depth?: number): T;
