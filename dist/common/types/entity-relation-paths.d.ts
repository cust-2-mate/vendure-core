import { VendureEntity } from '../../entity/base/base.entity';
/**
 * @description
 * This type allows type-safe access to entity relations using strings with dot notation.
 * It works to 2 levels deep.
 *
 * @example
 * ```TypeScript
 * type T1 = EntityRelationPaths<Product>;
 * ```
 * In the above example, the type `T1` will be a string union of all relations of the
 * `Product` entity:
 *
 *  * `'featuredAsset'`
 *  * `'variants'`
 *  * `'variants.options'`
 *  * `'variants.featuredAsset'`
 *  * etc.
 *
 * @docsCategory Common
 */
export declare type EntityRelationPaths<T extends VendureEntity> = `customFields.${string}` | PathsToStringProps1<T> | Join<PathsToStringProps2<T>, '.'> | TripleDotPath;
export declare type EntityRelationKeys<T extends VendureEntity> = {
    [K in Extract<keyof T, string>]: Required<T>[K] extends VendureEntity | null ? K : Required<T>[K] extends VendureEntity[] ? K : never;
}[Extract<keyof T, string>];
export declare type EntityRelations<T extends VendureEntity> = {
    [K in EntityRelationKeys<T>]: T[K];
};
export declare type PathsToStringProps1<T extends VendureEntity> = T extends string ? [] : {
    [K in EntityRelationKeys<T>]: K;
}[Extract<EntityRelationKeys<T>, string>];
export declare type PathsToStringProps2<T extends VendureEntity> = T extends string ? never : {
    [K in EntityRelationKeys<T>]: T[K] extends VendureEntity[] ? [K, PathsToStringProps1<T[K][number]>] : [K, PathsToStringProps1<T[K]>];
}[Extract<EntityRelationKeys<T>, string>];
export declare type TripleDotPath = `${string}.${string}.${string}`;
export declare type Join<T extends Array<string | any>, D extends string> = T extends [] ? never : T extends [infer F] ? F : T extends [infer F, ...infer R] ? F extends string ? `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string;
