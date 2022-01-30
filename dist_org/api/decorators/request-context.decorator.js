"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ctx = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../common/constants");
/**
 * @description
 * Resolver param decorator which extracts the {@link RequestContext} from the incoming
 * request object.
 *
 * @example
 * ```TypeScript
 *  \@Query()
 *  getAdministrators(\@Ctx() ctx: RequestContext) {
 *      // ...
 *  }
 * ```
 *
 * @docsCategory request
 * @docsPage Ctx Decorator
 */
exports.Ctx = common_1.createParamDecorator((data, ctx) => {
    if (ctx.getType() === 'graphql') {
        // GraphQL request
        return ctx.getArgByIndex(2).req[constants_1.REQUEST_CONTEXT_KEY];
    }
    else {
        // REST request
        return ctx.switchToHttp().getRequest()[constants_1.REQUEST_CONTEXT_KEY];
    }
});
//# sourceMappingURL=request-context.decorator.js.map