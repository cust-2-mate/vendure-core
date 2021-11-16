import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TransactionalConnection } from '../../service/transaction/transactional-connection';
/**
 * @description
 * Used by the {@link Transaction} decorator to create a transactional query runner
 * and attach it to the RequestContext.
 */
export declare class TransactionInterceptor implements NestInterceptor {
    private connection;
    private reflector;
    constructor(connection: TransactionalConnection, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    /**
     * @description
     * Executes the `work` function within the context of a transaction.
     */
    private withTransaction;
    /**
     * Attempts to start a DB transaction, with retry logic in the case that a transaction
     * is already started for the connection (which is mainly a problem with SQLite/Sql.js)
     */
    private startTransaction;
    /**
     * If the resolver function throws an error, there are certain cases in which
     * we want to retry the whole thing again - notably in the case of a deadlock
     * situation, which can usually be retried with success.
     */
    private isRetriableError;
}
