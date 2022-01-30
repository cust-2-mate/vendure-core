import { PartialVendureConfig, RuntimeVendureConfig } from './vendure-config';
/**
 * Override the default config by merging in the supplied values. Should only be used prior to
 * bootstrapping the app.
 */
export declare function setConfig(userConfig: PartialVendureConfig): void;
/**
 * Returns the app config object. In general this function should only be
 * used before bootstrapping the app. In all other contexts, the {@link ConfigService}
 * should be used to access config settings.
 */
export declare function getConfig(): Readonly<RuntimeVendureConfig>;
