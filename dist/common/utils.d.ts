import { AssetType } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { Observable, Observer } from 'rxjs';
/**
 * Takes a predicate function and returns a negated version.
 */
export declare function not(predicate: (...args: any[]) => boolean): (...args: any[]) => boolean;
/**
 * Returns a predicate function which returns true if the item is found in the set,
 * as determined by a === equality check on the given compareBy property.
 */
export declare function foundIn<T>(set: T[], compareBy: keyof T): (item: T) => boolean;
/**
 * Identity function which asserts to the type system that a promise which can resolve to T or undefined
 * does in fact resolve to T.
 * Used when performing a "find" operation on an entity which we are sure exists, as in the case that we
 * just successfully created or updated it.
 */
export declare function assertFound<T>(promise: Promise<T | undefined>): Promise<T>;
/**
 * Compare ID values for equality, taking into account the fact that they may not be of matching types
 * (string or number).
 */
export declare function idsAreEqual(id1?: ID, id2?: ID): boolean;
/**
 * Returns the AssetType based on the mime type.
 */
export declare function getAssetType(mimeType: string): AssetType;
/**
 * A simple normalization for email addresses. Lowercases the whole address,
 * even though technically the local part (before the '@') is case-sensitive
 * per the spec. In practice, however, it seems safe to treat emails as
 * case-insensitive to allow for users who might vary the usage of
 * upper/lower case. See more discussion here: https://ux.stackexchange.com/a/16849
 */
export declare function normalizeEmailAddress(input: string): string;
/**
 * Converts a value that may be wrapped into a Promise or Observable into a Promise-wrapped
 * value.
 */
export declare function awaitPromiseOrObservable<T>(value: T | Promise<T> | Observable<T>): Promise<T>;
/**
 * @description
 * Returns an observable which executes the given async work function and completes with
 * the returned value. This is useful in methods which need to return
 * an Observable but also want to work with async (Promise-returning) code.
 *
 * @example
 * ```TypeScript
 * \@Controller()
 * export class MyWorkerController {
 *
 *     \@MessagePattern('test')
 *     handleTest() {
 *         return asyncObservable(async observer => {
 *             const value = await this.connection.fetchSomething();
 *             return value;
 *         });
 *     }
 * }
 * ```
 */
export declare function asyncObservable<T>(work: (observer: Observer<T>) => Promise<T | void>): Observable<T>;
