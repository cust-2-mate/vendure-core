import { OnModuleDestroy } from '@nestjs/common';
import { Type } from '@vendure/common/lib/shared-types';
import { Observable } from 'rxjs';
import { TransactionSubscriber } from '../connection/transaction-subscriber';
import { VendureEvent } from './vendure-event';
/**
 * @description
 * The EventBus is used to globally publish events which can then be subscribed to.
 *
 * Events are published whenever certain actions take place within the Vendure server, for example:
 *
 * * when a Product is updated ({@link ProductEvent})
 * * when an Order transitions state ({@link OrderStateTransitionEvent})
 * * when a Customer registers a new account ({@link AccountRegistrationEvent})
 *
 * Using the EventBus it is possible to subscribe to an take action when these events occur.
 * This is done with the `.ofType()` method, which takes an event type and returns an rxjs observable
 * stream of events:
 *
 * @example
 * ```TypeScript
 * import { OnApplicationBootstrap } from '\@nestjs/common';
 * import { EventBus, PluginCommonModule, VendurePlugin } from '\@vendure/core';
 * import { filter } from 'rxjs/operators';
 *
 * \@VendurePlugin({
 *     imports: [PluginCommonModule]
 * })
 * export class MyPlugin implements OnApplicationBootstrap {
 *
 *   constructor(private eventBus: EventBus) {}
 *
 *   async onApplicationBootstrap() {
 *
 *     this.eventBus
 *       .ofType(OrderStateTransitionEvent)
 *       .pipe(
 *         filter(event => event.toState === 'PaymentSettled'),
 *       )
 *       .subscribe((event) => {
 *         // do some action when this event fires
 *       });
 *   }
 * }
 * ```
 *
 * @docsCategory events
 * */
export declare class EventBus implements OnModuleDestroy {
    private transactionSubscriber;
    private eventStream;
    private destroy$;
    constructor(transactionSubscriber: TransactionSubscriber);
    /**
     * @description
     * Publish an event which any subscribers can react to.
     */
    publish<T extends VendureEvent>(event: T): void;
    /**
     * @description
     * Returns an RxJS Observable stream of events of the given type.
     * If the event contains a {@link RequestContext} object, the subscriber
     * will only get called after any active database transactions are complete.
     *
     * This means that the subscriber function can safely access all updated
     * data related to the event.
     */
    ofType<T extends VendureEvent>(type: Type<T>): Observable<T>;
    /** @internal */
    onModuleDestroy(): any;
    /**
     * If the Event includes a RequestContext property, we need to check for any active transaction
     * associated with it, and if there is one, we await that transaction to either commit or rollback
     * before publishing the event.
     *
     * The reason for this is that if the transaction is still active when event subscribers execute,
     * this can cause a couple of issues:
     *
     * 1. If the transaction hasn't completed by the time the subscriber runs, the new data inside
     *  the transaction will not be available to the subscriber.
     * 2. If the subscriber gets a reference to the EntityManager which has an active transaction,
     *   and then the transaction completes, and then the subscriber attempts a DB operation using that
     *   EntityManager, a fatal QueryRunnerAlreadyReleasedError will be thrown.
     *
     * For more context on these two issues, see:
     *
     * * https://github.com/vendure-ecommerce/vendure/issues/520
     * * https://github.com/vendure-ecommerce/vendure/issues/1107
     */
    private awaitActiveTransactions;
}
