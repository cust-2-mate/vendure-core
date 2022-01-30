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
exports.RefundStateMachine = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const errors_1 = require("../../../common/error/errors");
const finite_state_machine_1 = require("../../../common/finite-state-machine/finite-state-machine");
const config_service_1 = require("../../../config/config.service");
const history_service_1 = require("../../services/history.service");
const refund_state_1 = require("./refund-state");
let RefundStateMachine = class RefundStateMachine {
    constructor(configService, historyService) {
        this.configService = configService;
        this.historyService = historyService;
        this.config = {
            transitions: refund_state_1.refundStateTransitions,
            onTransitionStart: async (fromState, toState, data) => {
                return true;
            },
            onTransitionEnd: async (fromState, toState, data) => {
                await this.historyService.createHistoryEntryForOrder({
                    ctx: data.ctx,
                    orderId: data.order.id,
                    type: generated_types_1.HistoryEntryType.ORDER_REFUND_TRANSITION,
                    data: {
                        refundId: data.refund.id,
                        from: fromState,
                        to: toState,
                        reason: data.refund.reason,
                    },
                });
            },
            onError: (fromState, toState, message) => {
                throw new errors_1.IllegalOperationError(message || 'error.cannot-transition-refund-from-to', {
                    fromState,
                    toState,
                });
            },
        };
    }
    getNextStates(refund) {
        const fsm = new finite_state_machine_1.FSM(this.config, refund.state);
        return fsm.getNextStates();
    }
    async transition(ctx, order, refund, state) {
        const fsm = new finite_state_machine_1.FSM(this.config, refund.state);
        await fsm.transitionTo(state, { ctx, order, refund });
        refund.state = state;
    }
};
RefundStateMachine = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService, history_service_1.HistoryService])
], RefundStateMachine);
exports.RefundStateMachine = RefundStateMachine;
//# sourceMappingURL=refund-state-machine.js.map