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
exports.EventBus = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const request_context_1 = require("../api/common/request-context");
const constants_1 = require("../common/constants");
const transaction_subscriber_1 = require("../connection/transaction-subscriber");
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
let EventBus = class EventBus {
    constructor(transactionSubscriber) {
        this.transactionSubscriber = transactionSubscriber;
        this.eventStream = new rxjs_1.Subject();
        this.destroy$ = new rxjs_1.Subject();
    }
    /**
     * @description
     * Publish an event which any subscribers can react to.
     */
    publish(event) {
        this.eventStream.next(event);
    }
    /**
     * @description
     * Returns an RxJS Observable stream of events of the given type.
     * If the event contains a {@link RequestContext} object, the subscriber
     * will only get called after any active database transactions are complete.
     *
     * This means that the subscriber function can safely access all updated
     * data related to the event.
     */
    ofType(type) {
        return this.eventStream.asObservable().pipe(operators_1.takeUntil(this.destroy$), operators_1.filter(e => e.constructor === type), operators_1.mergeMap(event => this.awaitActiveTransactions(event)));
    }
    /** @internal */
    onModuleDestroy() {
        this.destroy$.next();
    }
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
    async awaitActiveTransactions(event) {
        const ctx = Object.values(event).find(value => value instanceof request_context_1.RequestContext);
        if (!ctx) {
            return event;
        }
        const transactionManager = ctx[constants_1.TRANSACTION_MANAGER_KEY];
        if (!(transactionManager === null || transactionManager === void 0 ? void 0 : transactionManager.queryRunner)) {
            return event;
        }
        return this.transactionSubscriber.awaitRelease(transactionManager.queryRunner).then(() => event);
    }
};
EventBus = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transaction_subscriber_1.TransactionSubscriber])
], EventBus);
exports.EventBus = EventBus;
//# sourceMappingURL=event-bus.js.map