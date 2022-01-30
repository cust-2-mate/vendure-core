"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const request_context_1 = require("../api/common/request-context");
const constants_1 = require("../common/constants");
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
    constructor() {
        this.eventStream = new rxjs_1.Subject();
        this.destroy$ = new rxjs_1.Subject();
    }
    /**
     * @description
     * Publish an event which any subscribers can react to.
     */
    publish(event) {
        this.eventStream.next(this.prepareRequestContext(event));
    }
    /**
     * @description
     * Returns an RxJS Observable stream of events of the given type.
     */
    ofType(type) {
        return this.eventStream.asObservable().pipe(operators_1.takeUntil(this.destroy$), operators_1.filter(e => e.constructor === type));
    }
    /** @internal */
    onModuleDestroy() {
        this.destroy$.next();
    }
    /**
     * If the Event includes a RequestContext property, we need to:
     *
     * 1) Set it as a copy of the original
     * 2) Remove the TRANSACTION_MANAGER_KEY from that copy
     *
     * The TRANSACTION_MANAGER_KEY is used to track transactions across calls
     * (this is why we always pass the `ctx` object to get TransactionalConnection.getRepository() method).
     * However, allowing a transaction to continue in an async event subscriber function _will_ cause
     * very confusing issues (see https://github.com/vendure-ecommerce/vendure/issues/520), which is why
     * we simply remove the reference to the transaction manager from the context object altogether.
     */
    prepareRequestContext(event) {
        for (const propertyName of Object.getOwnPropertyNames(event)) {
            const property = event[propertyName];
            if (property instanceof request_context_1.RequestContext) {
                const ctxCopy = property.copy();
                delete ctxCopy[constants_1.TRANSACTION_MANAGER_KEY];
                event[propertyName] = ctxCopy;
            }
        }
        return event;
    }
};
EventBus = __decorate([
    common_1.Injectable()
], EventBus);
exports.EventBus = EventBus;
//# sourceMappingURL=event-bus.js.map