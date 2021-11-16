"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Allow = exports.PERMISSIONS_METADATA_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_METADATA_KEY = '__permissions__';
/**
 * @description
 * Attaches metadata to the resolver defining which permissions are required to execute the
 * operation, using one or more {@link Permission} values.
 *
 * In a GraphQL context, it can be applied to top-level queries and mutations as well as field resolvers.
 *
 * For REST controllers, it can be applied to route handlers.
 *
 * @example
 * ```TypeScript
 *  \@Allow(Permission.SuperAdmin)
 *  \@Query()
 *  getAdministrators() {
 *      // ...
 *  }
 * ```
 *
 * @docsCategory request
 * @docsPage Allow Decorator
 */
const Allow = (...permissions) => common_1.SetMetadata(exports.PERMISSIONS_METADATA_KEY, permissions);
exports.Allow = Allow;
//# sourceMappingURL=allow.decorator.js.map