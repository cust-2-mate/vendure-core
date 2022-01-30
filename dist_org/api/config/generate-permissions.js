"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePermissionEnum = void 0;
const stitch_1 = require("@graphql-tools/stitch");
const graphql_1 = require("graphql");
const constants_1 = require("../../common/constants");
const PERMISSION_DESCRIPTION = `@description
Permissions for administrators and customers. Used to control access to
GraphQL resolvers via the {@link Allow} decorator.

@docsCategory common`;
/**
 * Generates the `Permission` GraphQL enum based on the default & custom permission definitions.
 */
function generatePermissionEnum(schema, customPermissions) {
    const allPermissionsMetadata = constants_1.getAllPermissionsMetadata(customPermissions);
    const values = {};
    let i = 0;
    for (const entry of allPermissionsMetadata) {
        values[entry.name] = {
            value: i,
            description: entry.description,
        };
        i++;
    }
    const permissionsEnum = new graphql_1.GraphQLEnumType({
        name: 'Permission',
        description: PERMISSION_DESCRIPTION,
        values,
    });
    return stitch_1.stitchSchemas({
        subschemas: [schema],
        types: [permissionsEnum],
        typeMergingOptions: { validationSettings: { validationLevel: stitch_1.ValidationLevel.Off } },
    });
}
exports.generatePermissionEnum = generatePermissionEnum;
//# sourceMappingURL=generate-permissions.js.map