"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TRANSACTION_MODE_METADATA_KEY = void 0;
const common_1 = require("@nestjs/common");
const transaction_interceptor_1 = require("../middleware/transaction-interceptor");
exports.TRANSACTION_MODE_METADATA_KEY = '__transaction_mode__';
/**
 * @description
 * Runs the decorated method in a TypeORM transaction. It works by creating a transactional
 * QueryRunner which gets attached to the RequestContext object. When the RequestContext
 * is the passed to the {@link TransactionalConnection} `getRepository()` method, this
 * QueryRunner is used to execute the queries within this transaction.
 *
 * Essentially, the entire resolver function is wrapped in a try-catch block which commits the
 * transaction on successful completion of the method, or rolls back the transaction in an unhandled
 * error is thrown.
 *
 * @example
 * ```TypeScript
 * // in a GraphQL resolver file
 *
 * \@Transaction()
 * async myMutation(\@Ctx() ctx: RequestContext) {
 *   // as long as the `ctx` object is passed in to
 *   // all database operations, the entire mutation
 *   // will be run as an atomic transaction, and rolled
 *   // back if an error is thrown.
 *   const result = this.myService.createThing(ctx);
 *   return this.myService.updateOtherThing(ctx, result.id);
 * }
 * ```
 *
 * @docsCategory request
 * @docsPage Transaction Decorator
 * @docsWeight 0
 */
const Transaction = (transactionMode = 'auto') => {
    return common_1.applyDecorators(common_1.SetMetadata(exports.TRANSACTION_MODE_METADATA_KEY, transactionMode), common_1.UseInterceptors(transaction_interceptor_1.TransactionInterceptor));
};
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.decorator.js.map