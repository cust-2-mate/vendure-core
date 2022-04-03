import { EntityIdStrategy } from './entity-id-strategy';
/**
 * @description
 * An id strategy which uses string uuids as primary keys
 * for all entities. This strategy can be configured with the
 * `entityIdStrategy` property of the {@link VendureConfig}.
 *
 * @example
 * ```TypeScript
 * import { UuidIdStrategy, VendureConfig } from '\@vendure/core';
 *
 * export const config: VendureConfig = {
 *   entityIdStrategy: new UuidIdStrategy(),
 *   // ...
 * }
 * ```
 *
 * @docsCategory configuration
 * @docsPage EntityIdStrategy
 */
export declare class UuidIdStrategy implements EntityIdStrategy<'uuid'> {
    readonly primaryKeyType = "uuid";
    decodeId(id: string): string;
    encodeId(primaryKey: string): string;
}