"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const TransactionAlreadyStartedError_1 = require("typeorm/error/TransactionAlreadyStartedError");
const constants_1 = require("../../common/constants");
const transactional_connection_1 = require("../../service/transaction/transactional-connection");
const parse_context_1 = require("../common/parse-context");
const transaction_decorator_1 = require("../decorators/transaction.decorator");
/**
 * @description
 * Used by the {@link Transaction} decorator to create a transactional query runner
 * and attach it to the RequestContext.
 */
let TransactionInterceptor = class TransactionInterceptor {
    constructor(connection, reflector) {
        this.connection = connection;
        this.reflector = reflector;
    }
    intercept(context, next) {
        const { isGraphQL, req } = parse_context_1.parseContext(context);
        const ctx = req[constants_1.REQUEST_CONTEXT_KEY];
        if (ctx) {
            const transactionMode = this.reflector.get(transaction_decorator_1.TRANSACTION_MODE_METADATA_KEY, context.getHandler());
            return rxjs_1.of(this.withTransaction(ctx, () => next.handle(), transactionMode));
        }
        else {
            return next.handle();
        }
    }
    /**
     * @description
     * Executes the `work` function within the context of a transaction.
     */
    async withTransaction(ctx, work, mode) {
        const queryRunnerExists = !!ctx[constants_1.TRANSACTION_MANAGER_KEY];
        if (queryRunnerExists) {
            // If a QueryRunner already exists on the RequestContext, there must be an existing
            // outer transaction in progress. In that case, we just execute the work function
            // as usual without needing to further wrap in a transaction.
            return work().toPromise();
        }
        const queryRunner = this.connection.rawConnection.createQueryRunner();
        if (mode === 'auto') {
            await this.startTransaction(queryRunner);
        }
        ctx[constants_1.TRANSACTION_MANAGER_KEY] = queryRunner.manager;
        try {
            const maxRetries = 5;
            const result = await work()
                .pipe(operators_1.retryWhen(errors => errors.pipe(operators_1.tap(err => {
                if (!this.isRetriableError(err)) {
                    throw err;
                }
            }), operators_1.take(maxRetries))))
                .toPromise();
            if (queryRunner.isTransactionActive) {
                await queryRunner.commitTransaction();
            }
            return result;
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            if ((queryRunner === null || queryRunner === void 0 ? void 0 : queryRunner.isReleased) === false) {
                await queryRunner.release();
            }
        }
    }
    /**
     * Attempts to start a DB transaction, with retry logic in the case that a transaction
     * is already started for the connection (which is mainly a problem with SQLite/Sql.js)
     */
    async startTransaction(queryRunner) {
        const maxRetries = 25;
        let attempts = 0;
        let lastError;
        // Returns false if a transaction is already in progress
        async function attemptStartTransaction() {
            try {
                await queryRunner.startTransaction();
                return true;
            }
            catch (err) {
                lastError = err;
                if (err instanceof TransactionAlreadyStartedError_1.TransactionAlreadyStartedError) {
                    return false;
                }
                throw err;
            }
        }
        while (attempts < maxRetries) {
            const result = await attemptStartTransaction();
            if (result) {
                return;
            }
            attempts++;
            // insert an increasing delay before retrying
            await new Promise(resolve => setTimeout(resolve, attempts * 20));
        }
        throw lastError;
    }
    /**
     * If the resolver function throws an error, there are certain cases in which
     * we want to retry the whole thing again - notably in the case of a deadlock
     * situation, which can usually be retried with success.
     */
    isRetriableError(err) {
        const mysqlDeadlock = err.code === 'ER_LOCK_DEADLOCK';
        const postgresDeadlock = err.code === 'deadlock_detected';
        return mysqlDeadlock || postgresDeadlock;
    }
};
TransactionInterceptor = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection, core_1.Reflector])
], TransactionInterceptor);
exports.TransactionInterceptor = TransactionInterceptor;
//# sourceMappingURL=transaction-interceptor.js.map