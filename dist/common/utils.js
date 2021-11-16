"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncObservable = exports.awaitPromiseOrObservable = exports.normalizeEmailAddress = exports.getAssetType = exports.idsAreEqual = exports.assertFound = exports.foundIn = exports.not = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const rxjs_1 = require("rxjs");
/**
 * Takes a predicate function and returns a negated version.
 */
function not(predicate) {
    return (...args) => !predicate(...args);
}
exports.not = not;
/**
 * Returns a predicate function which returns true if the item is found in the set,
 * as determined by a === equality check on the given compareBy property.
 */
function foundIn(set, compareBy) {
    return (item) => set.some(t => t[compareBy] === item[compareBy]);
}
exports.foundIn = foundIn;
/**
 * Identity function which asserts to the type system that a promise which can resolve to T or undefined
 * does in fact resolve to T.
 * Used when performing a "find" operation on an entity which we are sure exists, as in the case that we
 * just successfully created or updated it.
 */
function assertFound(promise) {
    return promise;
}
exports.assertFound = assertFound;
/**
 * Compare ID values for equality, taking into account the fact that they may not be of matching types
 * (string or number).
 */
function idsAreEqual(id1, id2) {
    if (id1 === undefined || id2 === undefined) {
        return false;
    }
    return id1.toString() === id2.toString();
}
exports.idsAreEqual = idsAreEqual;
/**
 * Returns the AssetType based on the mime type.
 */
function getAssetType(mimeType) {
    const type = mimeType.split('/')[0];
    switch (type) {
        case 'image':
            return generated_types_1.AssetType.IMAGE;
        case 'video':
            return generated_types_1.AssetType.VIDEO;
        default:
            return generated_types_1.AssetType.BINARY;
    }
}
exports.getAssetType = getAssetType;
/**
 * A simple normalization for email addresses. Lowercases the whole address,
 * even though technically the local part (before the '@') is case-sensitive
 * per the spec. In practice, however, it seems safe to treat emails as
 * case-insensitive to allow for users who might vary the usage of
 * upper/lower case. See more discussion here: https://ux.stackexchange.com/a/16849
 */
function normalizeEmailAddress(input) {
    return input.trim().toLowerCase();
}
exports.normalizeEmailAddress = normalizeEmailAddress;
/**
 * Converts a value that may be wrapped into a Promise or Observable into a Promise-wrapped
 * value.
 */
async function awaitPromiseOrObservable(value) {
    let result = await value;
    if (result instanceof rxjs_1.Observable) {
        result = await result.toPromise();
    }
    return result;
}
exports.awaitPromiseOrObservable = awaitPromiseOrObservable;
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
function asyncObservable(work) {
    return new rxjs_1.Observable(subscriber => {
        (async () => {
            try {
                const result = await work(subscriber);
                if (result) {
                    subscriber.next(result);
                }
                subscriber.complete();
            }
            catch (e) {
                subscriber.error(e);
            }
        })();
    });
}
exports.asyncObservable = asyncObservable;
//# sourceMappingURL=utils.js.map