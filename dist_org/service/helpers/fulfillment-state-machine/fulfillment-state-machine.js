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
exports.FulfillmentStateMachine = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../../common/error/errors");
const finite_state_machine_1 = require("../../../common/finite-state-machine/finite-state-machine");
const merge_transition_definitions_1 = require("../../../common/finite-state-machine/merge-transition-definitions");
const validate_transition_definition_1 = require("../../../common/finite-state-machine/validate-transition-definition");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const history_service_1 = require("../../services/history.service");
const fulfillment_state_1 = require("./fulfillment-state");
let FulfillmentStateMachine = class FulfillmentStateMachine {
    constructor(configService, historyService) {
        this.configService = configService;
        this.historyService = historyService;
        this.initialState = 'Created';
        this.config = this.initConfig();
    }
    getInitialState() {
        return this.initialState;
    }
    canTransition(currentState, newState) {
        return new finite_state_machine_1.FSM(this.config, currentState).canTransitionTo(newState);
    }
    getNextStates(fulfillment) {
        const fsm = new finite_state_machine_1.FSM(this.config, fulfillment.state);
        return fsm.getNextStates();
    }
    async transition(ctx, fulfillment, orders, state) {
        const fsm = new finite_state_machine_1.FSM(this.config, fulfillment.state);
        await fsm.transitionTo(state, { ctx, orders, fulfillment });
        fulfillment.state = fsm.currentState;
    }
    /**
     * Specific business logic to be executed on Fulfillment state transitions.
     */
    async onTransitionStart(fromState, toState, data) {
        const { fulfillmentHandlers } = this.configService.shippingOptions;
        const fulfillmentHandler = fulfillmentHandlers.find(h => h.code === data.fulfillment.handlerCode);
        if (fulfillmentHandler) {
            const result = await utils_1.awaitPromiseOrObservable(fulfillmentHandler.onFulfillmentTransition(fromState, toState, data));
            if (result === false || typeof result === 'string') {
                return result;
            }
        }
    }
    /**
     * Specific business logic to be executed after Fulfillment state transition completes.
     */
    async onTransitionEnd(fromState, toState, data) {
        const historyEntryPromises = data.orders.map(order => this.historyService.createHistoryEntryForOrder({
            orderId: order.id,
            type: generated_types_1.HistoryEntryType.ORDER_FULFILLMENT_TRANSITION,
            ctx: data.ctx,
            data: {
                fulfillmentId: data.fulfillment.id,
                from: fromState,
                to: toState,
            },
        }));
        await Promise.all(historyEntryPromises);
    }
    initConfig() {
        var _a;
        const customProcesses = (_a = this.configService.shippingOptions.customFulfillmentProcess) !== null && _a !== void 0 ? _a : [];
        const allTransitions = customProcesses.reduce((transitions, process) => merge_transition_definitions_1.mergeTransitionDefinitions(transitions, process.transitions), fulfillment_state_1.fulfillmentStateTransitions);
        const validationResult = validate_transition_definition_1.validateTransitionDefinition(allTransitions, 'Pending');
        return {
            transitions: allTransitions,
            onTransitionStart: async (fromState, toState, data) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionStart === 'function') {
                        const result = await utils_1.awaitPromiseOrObservable(process.onTransitionStart(fromState, toState, data));
                        if (result === false || typeof result === 'string') {
                            return result;
                        }
                    }
                }
                return this.onTransitionStart(fromState, toState, data);
            },
            onTransitionEnd: async (fromState, toState, data) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionEnd === 'function') {
                        await utils_1.awaitPromiseOrObservable(process.onTransitionEnd(fromState, toState, data));
                    }
                }
                await this.onTransitionEnd(fromState, toState, data);
            },
            onError: async (fromState, toState, message) => {
                for (const process of customProcesses) {
                    if (typeof process.onTransitionError === 'function') {
                        await utils_1.awaitPromiseOrObservable(process.onTransitionError(fromState, toState, message));
                    }
                }
                throw new errors_1.IllegalOperationError(message || 'error.cannot-transition-fulfillment-from-to', {
                    fromState,
                    toState,
                });
            },
        };
    }
};
FulfillmentStateMachine = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService, history_service_1.HistoryService])
], FulfillmentStateMachine);
exports.FulfillmentStateMachine = FulfillmentStateMachine;
//# sourceMappingURL=fulfillment-state-machine.js.map