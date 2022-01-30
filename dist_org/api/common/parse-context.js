"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContext = void 0;
const graphql_1 = require("@nestjs/graphql");
/**
 * Parses in the Nest ExecutionContext of the incoming request, accounting for both
 * GraphQL & REST requests.
 */
function parseContext(context) {
    var _a, _b, _c;
    // TODO: Remove this check once this issue is resolved: https://github.com/nestjs/graphql/pull/1469
    if (((_c = (_b = (_a = context).getHandler) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.name) === '__resolveType') {
        return {
            req: context.getArgs()[1].req,
            res: context.getArgs()[1].res,
            isGraphQL: false,
            info: undefined,
        };
    }
    const graphQlContext = graphql_1.GqlExecutionContext.create(context);
    const info = graphQlContext.getInfo();
    let req;
    let res;
    if (info) {
        const ctx = graphQlContext.getContext();
        req = ctx.req;
        res = ctx.res;
    }
    else {
        req = context.switchToHttp().getRequest();
        res = context.switchToHttp().getResponse();
    }
    return {
        req,
        res,
        info,
        isGraphQL: !!info,
    };
}
exports.parseContext = parseContext;
//# sourceMappingURL=parse-context.js.map