import { INestApplication } from '@nestjs/common';
import { Type } from '@vendure/common/lib/shared-types';
import { RuntimeVendureConfig, VendureConfig } from './config/vendure-config';
import { VendureWorker } from './worker/vendure-worker';
export declare type VendureBootstrapFunction = (config: VendureConfig) => Promise<INestApplication>;
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
export declare function bootstrap(userConfig: Partial<VendureConfig>): Promise<INestApplication>;
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
export declare function bootstrapWorker(userConfig: Partial<VendureConfig>): Promise<VendureWorker>;
/**
 * Setting the global config must be done prior to loading the AppModule.
 */
export declare function preBootstrapConfig(userConfig: Partial<VendureConfig>): Promise<Readonly<RuntimeVendureConfig>>;
/**
 * Returns an array of core entities and any additional entities defined in plugins.
 */
export declare function getAllEntities(userConfig: Partial<VendureConfig>): Promise<Array<Type<any>>>;
