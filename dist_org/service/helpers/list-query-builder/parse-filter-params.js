"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFilterParams = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const DateUtils_1 = require("typeorm/util/DateUtils");
const errors_1 = require("../../../common/error/errors");
const connection_utils_1 = require("./connection-utils");
const get_calculated_columns_1 = require("./get-calculated-columns");
function parseFilterParams(connection, entity, filterParams, customPropertyMap) {
    if (!filterParams) {
        return [];
    }
    const { columns, translationColumns, alias } = connection_utils_1.getColumnMetadata(connection, entity);
    const calculatedColumns = get_calculated_columns_1.getCalculatedColumns(entity);
    const output = [];
    const dbType = connection.options.type;
    let argIndex = 1;
    for (const [key, operation] of Object.entries(filterParams)) {
        if (operation) {
            const calculatedColumnDef = calculatedColumns.find(c => c.name === key);
            const instruction = calculatedColumnDef === null || calculatedColumnDef === void 0 ? void 0 : calculatedColumnDef.listQuery;
            const calculatedColumnExpression = instruction === null || instruction === void 0 ? void 0 : instruction.expression;
            for (const [operator, operand] of Object.entries(operation)) {
                let fieldName;
                if (columns.find(c => c.propertyName === key)) {
                    fieldName = `${alias}.${key}`;
                }
                else if (translationColumns.find(c => c.propertyName === key)) {
                    const translationsAlias = connection.namingStrategy.eagerJoinRelationAlias(alias, 'translations');
                    fieldName = `${translationsAlias}.${key}`;
                }
                else if (calculatedColumnExpression) {
                    fieldName = connection_utils_1.escapeCalculatedColumnExpression(connection, calculatedColumnExpression);
                }
                else if (customPropertyMap === null || customPropertyMap === void 0 ? void 0 : customPropertyMap[key]) {
                    fieldName = customPropertyMap[key];
                }
                else {
                    throw new errors_1.UserInputError('error.invalid-filter-field');
                }
                const condition = buildWhereCondition(fieldName, operator, operand, argIndex, dbType);
                output.push(condition);
                argIndex++;
            }
        }
    }
    return output;
}
exports.parseFilterParams = parseFilterParams;
function buildWhereCondition(fieldName, operator, operand, argIndex, dbType) {
    switch (operator) {
        case 'eq':
            return {
                clause: `${fieldName} = :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: convertDate(operand) },
            };
        case 'notEq':
            return {
                clause: `${fieldName} != :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: convertDate(operand) },
            };
        case 'contains': {
            const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';
            return {
                clause: `${fieldName} ${LIKE} :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: `%${operand.trim()}%` },
            };
        }
        case 'notContains': {
            const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';
            return {
                clause: `${fieldName} NOT ${LIKE} :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: `%${operand.trim()}%` },
            };
        }
        case 'in':
            return {
                clause: `${fieldName} IN (:...arg${argIndex})`,
                parameters: { [`arg${argIndex}`]: operand },
            };
        case 'notIn':
            return {
                clause: `${fieldName} NOT IN (:...arg${argIndex})`,
                parameters: { [`arg${argIndex}`]: operand },
            };
        case 'regex':
            return {
                clause: getRegexpClause(fieldName, argIndex, dbType),
                parameters: { [`arg${argIndex}`]: operand },
            };
        case 'lt':
        case 'before':
            return {
                clause: `${fieldName} < :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: convertDate(operand) },
            };
        case 'gt':
        case 'after':
            return {
                clause: `${fieldName} > :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: convertDate(operand) },
            };
        case 'lte':
            return {
                clause: `${fieldName} <= :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: operand },
            };
        case 'gte':
            return {
                clause: `${fieldName} >= :arg${argIndex}`,
                parameters: { [`arg${argIndex}`]: operand },
            };
        case 'between':
            return {
                clause: `${fieldName} BETWEEN :arg${argIndex}_a AND :arg${argIndex}_b`,
                parameters: {
                    [`arg${argIndex}_a`]: convertDate(operand.start),
                    [`arg${argIndex}_b`]: convertDate(operand.end),
                },
            };
        default:
            shared_utils_1.assertNever(operator);
    }
    return {
        clause: '1',
        parameters: {},
    };
}
/**
 * Converts a JS Date object to a string format recognized by all DB engines.
 * See https://github.com/vendure-ecommerce/vendure/issues/251
 */
function convertDate(input) {
    if (input instanceof Date) {
        return DateUtils_1.DateUtils.mixedDateToUtcDatetimeString(input);
    }
    return input;
}
/**
 * Returns a valid regexp clause based on the current DB driver type.
 */
function getRegexpClause(fieldName, argIndex, dbType) {
    switch (dbType) {
        case 'mariadb':
        case 'mysql':
        case 'sqljs':
        case 'better-sqlite3':
        case 'aurora-data-api':
            return `${fieldName} REGEXP :arg${argIndex}`;
        case 'postgres':
        case 'aurora-data-api-pg':
        case 'cockroachdb':
            return `${fieldName} ~* :arg${argIndex}`;
        // The node-sqlite3 driver does not support user-defined functions
        // and therefore we are unable to define a custom regexp
        // function. See https://github.com/mapbox/node-sqlite3/issues/140
        case 'sqlite':
        default:
            throw new errors_1.InternalServerError(`The 'regex' filter is not available when using the '${dbType}' driver`);
    }
}
//# sourceMappingURL=parse-filter-params.js.map