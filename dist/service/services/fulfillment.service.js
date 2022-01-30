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
exports.FulfillmentService = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const config_service_1 = require("../../config/config.service");
const transactional_connection_1 = require("../../connection/transactional-connection");
const fulfillment_entity_1 = require("../../entity/fulfillment/fulfillment.entity");
const event_bus_1 = require("../../event-bus/event-bus");
const fulfillment_event_1 = require("../../event-bus/events/fulfillment-event");
const fulfillment_state_transition_event_1 = require("../../event-bus/events/fulfillment-state-transition-event");
const custom_field_relation_service_1 = require("../helpers/custom-field-relation/custom-field-relation.service");
const fulfillment_state_machine_1 = require("../helpers/fulfillment-state-machine/fulfillment-state-machine");
/**
 * @description
 * Contains methods relating to {@link Fulfillment} entities.
 *
 * @docsCategory services
 */
let FulfillmentService = class FulfillmentService {
    constructor(connection, fulfillmentStateMachine, eventBus, configService, customFieldRelationService) {
        this.connection = connection;
        this.fulfillmentStateMachine = fulfillmentStateMachine;
        this.eventBus = eventBus;
        this.configService = configService;
        this.customFieldRelationService = customFieldRelationService;
    }
    /**
     * @description
     * Creates a new Fulfillment for the given Orders and OrderItems, using the specified
     * {@link FulfillmentHandler}.
     */
    async create(ctx, orders, items, handler) {
        const fulfillmentHandler = this.configService.shippingOptions.fulfillmentHandlers.find(h => h.code === handler.code);
        if (!fulfillmentHandler) {
            return new generated_graphql_admin_errors_1.InvalidFulfillmentHandlerError();
        }
        let fulfillmentPartial;
        try {
            fulfillmentPartial = await fulfillmentHandler.createFulfillment(ctx, orders, items, handler.arguments);
        }
        catch (e) {
            let message = 'No error message';
            if (shared_utils_1.isObject(e)) {
                message = e.message || e.toString();
            }
            return new generated_graphql_admin_errors_1.CreateFulfillmentError(message);
        }
        const newFulfillment = await this.connection.getRepository(ctx, fulfillment_entity_1.Fulfillment).save(new fulfillment_entity_1.Fulfillment(Object.assign(Object.assign({ method: '', trackingCode: '' }, fulfillmentPartial), { orderItems: items, state: this.fulfillmentStateMachine.getInitialState(), handlerCode: fulfillmentHandler.code })));
        const fulfillmentWithRelations = await this.customFieldRelationService.updateRelations(ctx, fulfillment_entity_1.Fulfillment, fulfillmentPartial, newFulfillment);
        this.eventBus.publish(new fulfillment_event_1.FulfillmentEvent(ctx, fulfillmentWithRelations, {
            orders,
            items,
            handler,
        }));
        return newFulfillment;
    }
    async findOneOrThrow(ctx, id, relations = ['orderItems']) {
        return await this.connection.getEntityOrThrow(ctx, fulfillment_entity_1.Fulfillment, id, {
            relations,
        });
    }
    /**
     * @description
     * Returns all OrderItems associated with the specified Fulfillment.
     */
    async getOrderItemsByFulfillmentId(ctx, id) {
        const fulfillment = await this.findOneOrThrow(ctx, id);
        return fulfillment.orderItems;
    }
    /**
     * @description
     * Transitions the specified Fulfillment to a new state and upon successful transition
     * publishes a {@link FulfillmentStateTransitionEvent}.
     */
    async transitionToState(ctx, fulfillmentId, state) {
        const fulfillment = await this.findOneOrThrow(ctx, fulfillmentId, [
            'orderItems',
            'orderItems.line',
            'orderItems.line.order',
        ]);
        // Find orders based on order items filtering by id, removing duplicated orders
        const ordersInOrderItems = fulfillment.orderItems.map(oi => oi.line.order);
        const orders = ordersInOrderItems.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const fromState = fulfillment.state;
        try {
            await this.fulfillmentStateMachine.transition(ctx, fulfillment, orders, state);
        }
        catch (e) {
            const transitionError = ctx.translate(e.message, { fromState, toState: state });
            return new generated_graphql_admin_errors_1.FulfillmentStateTransitionError(transitionError, fromState, state);
        }
        await this.connection.getRepository(ctx, fulfillment_entity_1.Fulfillment).save(fulfillment, { reload: false });
        this.eventBus.publish(new fulfillment_state_transition_event_1.FulfillmentStateTransitionEvent(fromState, state, ctx, fulfillment));
        return { fulfillment, orders, fromState, toState: state };
    }
    /**
     * @description
     * Returns an array of the next valid states for the Fulfillment.
     */
    getNextStates(fulfillment) {
        return this.fulfillmentStateMachine.getNextStates(fulfillment);
    }
};
FulfillmentService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection,
        fulfillment_state_machine_1.FulfillmentStateMachine,
        event_bus_1.EventBus,
        config_service_1.ConfigService,
        custom_field_relation_service_1.CustomFieldRelationService])
], FulfillmentService);
exports.FulfillmentService = FulfillmentService;
//# sourceMappingURL=fulfillment.service.js.map