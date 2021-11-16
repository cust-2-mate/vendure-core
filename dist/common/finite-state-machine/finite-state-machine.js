"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSM = void 0;
const utils_1 = require("../utils");
/**
 * @description
 * A simple type-safe finite state machine. This is used internally to control the Order process, ensuring that
 * the state of Orders, Payments, Fulfillments and Refunds follows a well-defined behaviour.
 *
 * @docsCategory StateMachine
 */
class FSM {
    constructor(config, initialState) {
        this.config = config;
        this._currentState = initialState;
        this._initialState = initialState;
    }
    /**
     * Returns the state with which the FSM was initialized.
     */
    get initialState() {
        return this._initialState;
    }
    /**
     * Returns the current state.
     */
    get currentState() {
        return this._currentState;
    }
    async transitionTo(state, data) {
        if (this.canTransitionTo(state)) {
            // If the onTransitionStart callback is defined, invoke it. If it returns false,
            // then the transition will be cancelled.
            if (typeof this.config.onTransitionStart === 'function') {
                const canTransition = await utils_1.awaitPromiseOrObservable(this.config.onTransitionStart(this._currentState, state, data));
                if (canTransition === false) {
                    return;
                }
                else if (typeof canTransition === 'string') {
                    await this.onError(this._currentState, state, canTransition);
                    return;
                }
            }
            const fromState = this._currentState;
            // All is well, so transition to the new state.
            this._currentState = state;
            // If the onTransitionEnd callback is defined, invoke it.
            if (typeof this.config.onTransitionEnd === 'function') {
                await utils_1.awaitPromiseOrObservable(this.config.onTransitionEnd(fromState, state, data));
            }
        }
        else {
            return this.onError(this._currentState, state);
        }
    }
    /**
     * Jumps from the current state to the given state without regard to whether this transition is allowed or not.
     * None of the lifecycle callbacks will be invoked.
     */
    jumpTo(state) {
        this._currentState = state;
    }
    /**
     * Returns an array of state to which the machine may transition from the current state.
     */
    getNextStates() {
        return this.config.transitions[this._currentState].to;
    }
    /**
     * Returns true if the machine can transition from its current state to the given state.
     */
    canTransitionTo(state) {
        return -1 < this.config.transitions[this._currentState].to.indexOf(state);
    }
    async onError(fromState, toState, message) {
        if (typeof this.config.onError === 'function') {
            await utils_1.awaitPromiseOrObservable(this.config.onError(fromState, toState, message));
        }
    }
}
exports.FSM = FSM;
//# sourceMappingURL=finite-state-machine.js.map