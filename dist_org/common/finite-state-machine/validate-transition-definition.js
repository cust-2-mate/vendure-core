"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransitionDefinition = void 0;
/**
 * This function validates a finite state machine transition graph to ensure
 * that all states are reachable from the given initial state.
 */
function validateTransitionDefinition(transitions, initialState) {
    const states = Object.keys(transitions);
    const result = states.reduce((res, state) => {
        return Object.assign(Object.assign({}, res), { [state]: { reachable: false } });
    }, {});
    // walk the state graph starting with the initialState and
    // check whether all states are reachable.
    function allStatesReached() {
        return Object.values(result).every((r) => r.reachable);
    }
    function walkGraph(state) {
        const candidates = transitions[state].to;
        result[state].reachable = true;
        if (allStatesReached()) {
            return true;
        }
        for (const candidate of candidates) {
            if (!result[candidate].reachable) {
                walkGraph(candidate);
            }
        }
    }
    walkGraph(initialState);
    if (!allStatesReached()) {
        return {
            valid: false,
            error: `The following states are unreachable: ${Object.entries(result)
                .filter(([s, v]) => !v.reachable)
                .map(([s]) => s)
                .join(', ')}`,
        };
    }
    else {
        return {
            valid: true,
        };
    }
}
exports.validateTransitionDefinition = validateTransitionDefinition;
//# sourceMappingURL=validate-transition-definition.js.map