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
exports.PaymentStateMachine = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../../common/error/errors");
const finite_state_machine_1 = require("../../../common/finite-state-machine/finite-state-machine");
const merge_transition_definitions_1 = require("../../../common/finite-state-machine/merge-transition-definitions");
const validate_transition_definition_1 = require("../../../common/finite-state-machine/validate-transition-definition");
const utils_1 = require("../../../common/utils");
const config_service_1 = require("../../../config/config.service");
const history_service_1 = require("../../services/history.service");
const payment_state_1 = require("./payment-state");
let PaymentStateMachine = class PaymentStateMachine {
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
    getNextStates(payment) {
        const fsm = new finite_state_machine_1.FSM(this.config, payment.state);
        return fsm.getNextStates();
    }
    async transition(ctx, order, payment, state) {
        const fsm = new finite_state_machine_1.FSM(this.config, payment.state);
        await fsm.transitionTo(state, { ctx, order, payment });
        payment.state = state;
    }
    /**
     * Specific business logic to be executed on Payment state transitions.
     */
    async onTransitionStart(fromState, toState, data) {
        /**/
    }
    async onTransitionEnd(fromState, toState, data) {
        await this.historyService.createHistoryEntryForOrder({
            ctx: data.ctx,
            orderId: data.order.id,
            type: generated_types_1.HistoryEntryType.ORDER_PAYMENT_TRANSITION,
            data: {
                paymentId: data.payment.id,
                from: fromState,
                to: toState,
            },
        });
    }
    initConfig() {
        var _a;
        const { paymentMethodHandlers } = this.configService.paymentOptions;
        const customProcesses = (_a = this.configService.paymentOptions.customPaymentProcess) !== null && _a !== void 0 ? _a : [];
        const allTransitions = customProcesses.reduce((transitions, process) => merge_transition_definitions_1.mergeTransitionDefinitions(transitions, process.transitions), payment_state_1.paymentStateTransitions);
        validate_transition_definition_1.validateTransitionDefinition(allTransitions, this.initialState);
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
                for (const handler of paymentMethodHandlers) {
                    if (data.payment.method === handler.code) {
                        const result = await utils_1.awaitPromiseOrObservable(handler.onStateTransitionStart(fromState, toState, data));
                        if (result !== true) {
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
                throw new errors_1.IllegalOperationError(message || 'error.cannot-transition-payment-from-to', {
                    fromState,
                    toState,
                });
            },
        };
    }
};
PaymentStateMachine = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService, history_service_1.HistoryService])
], PaymentStateMachine);
exports.PaymentStateMachine = PaymentStateMachine;
//# sourceMappingURL=payment-state-machine.js.map