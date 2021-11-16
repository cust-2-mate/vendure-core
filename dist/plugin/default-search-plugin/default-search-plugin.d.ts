import { OnApplicationBootstrap } from '@nestjs/common';
import { SearchReindexResponse } from '@vendure/common/lib/generated-types';
import { EventBus } from '../../event-bus/event-bus';
import { SearchIndexService } from './indexer/search-index.service';
export interface DefaultSearchReindexResponse extends SearchReindexResponse {
    timeTaken: number;
    indexedItemCount: number;
}
/**
 * @description
 * The DefaultSearchPlugin provides a full-text Product search based on the full-text searching capabilities of the
 * underlying database.
 *
 * The DefaultSearchPlugin is bundled with the `\@vendure/core` package. If you are not using an alternative search
 * plugin, then make sure this one is used, otherwise you will not be able to search products via the
 * [`search` query](/docs/graphql-api/shop/queries#search).
 *
 * {{% alert "warning" %}}
 * Note that the quality of the fulltext search capabilities varies depending on the underlying database being used. For example,
 * the MySQL & Postgres implementations will typically yield better results than the SQLite implementation.
 * {{% /alert %}}
 *
 *
 * @example
 * ```ts
 * import { DefaultSearchPlugin, VendureConfig } from '\@vendure/core';
 *
 * export const config: VendureConfig = {
 *   // Add an instance of the plugin to the plugins array
 *   plugins: [
 *     DefaultSearchPlugin,
 *   ],
 * };
 * ```
 *
 * @docsCategory DefaultSearchPlugin
 */
export declare class DefaultSearchPlugin implements OnApplicationBootstrap {
    private eventBus;
    private searchIndexService;
    /** @internal */
    constructor(eventBus: EventBus, searchIndexService: SearchIndexService);
    /** @internal */
    onApplicationBootstrap(): Promise<void>;
}
