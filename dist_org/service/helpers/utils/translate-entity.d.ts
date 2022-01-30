import { LanguageCode } from '@vendure/common/lib/generated-types';
import { UnwrappedArray } from '../../../common/types/common-types';
import { Translatable, Translated } from '../../../common/types/locale-types';
import { VendureEntity } from '../../../entity/base/base.entity';
export declare type TranslatableRelationsKeys<T> = {
    [K in keyof T]: T[K] extends string ? never : T[K] extends number ? never : T[K] extends boolean ? never : T[K] extends undefined ? never : T[K] extends string[] ? never : T[K] extends number[] ? never : T[K] extends boolean[] ? never : K extends 'translations' ? never : K extends 'customFields' ? never : K;
}[keyof T];
export declare type NestedTranslatableRelations<T> = {
    [K in TranslatableRelationsKeys<T>]: T[K] extends any[] ? [
        K,
        TranslatableRelationsKeys<UnwrappedArray<T[K]>>
    ] : [
        K,
        TranslatableRelationsKeys<T[K]>
    ];
};
export declare type NestedTranslatableRelationKeys<T> = NestedTranslatableRelations<T>[keyof NestedTranslatableRelations<T>];
export declare type DeepTranslatableRelations<T> = Array<TranslatableRelationsKeys<T> | NestedTranslatableRelationKeys<T>>;
/**
 * Converts a Translatable entity into the public-facing entity by unwrapping
 * the translated strings from the matching Translation entity.
 */
export declare function translateEntity<T extends Translatable & VendureEntity>(translatable: T, languageCode: LanguageCode): Translated<T>;
/**
 * Translates an entity and its deeply-nested translatable properties. Supports up to 2 levels of nesting.
 */
export declare function translateDeep<T extends Translatable & VendureEntity>(translatable: T, languageCode: LanguageCode, translatableRelations?: DeepTranslatableRelations<T>): Translated<T>;
export declare type TreeNode = {
    children: TreeNode[];
} & Translatable & VendureEntity;
/**
 * Translates a tree structure of Translatable entities
 */
export declare function translateTree<T extends TreeNode>(node: T, languageCode: LanguageCode, translatableRelations?: DeepTranslatableRelations<T>): Translated<T>;
