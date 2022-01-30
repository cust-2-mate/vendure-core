"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionFilter = void 0;
const configurable_operation_1 = require("../../common/configurable-operation");
// tslint:disable:max-line-length
/**
 * @description
 * A CollectionFilter defines a rule which can be used to associate ProductVariants with a Collection.
 * The filtering is done by defining the `apply()` function, which receives a TypeORM
 * [`QueryBuilder`](https://typeorm.io/#/select-query-builder) object to which clauses may be added.
 *
 * Creating a CollectionFilter is considered an advanced Vendure topic. For more insight into how
 * they work, study the [default collection filters](https://github.com/vendure-ecommerce/vendure/blob/master/packages/core/src/config/catalog/default-collection-filters.ts)
 *
 * @docsCategory configuration
 */
class CollectionFilter extends configurable_operation_1.ConfigurableOperationDef {
    constructor(config) {
        super(config);
        this.applyFn = config.apply;
    }
    apply(qb, args) {
        return this.applyFn(qb, this.argsArrayToHash(args));
    }
}
exports.CollectionFilter = CollectionFilter;
//# sourceMappingURL=collection-filter.js.map