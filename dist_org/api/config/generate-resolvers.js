"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResolvers = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const graphql_scalars_1 = require("graphql-scalars");
const graphql_upload_1 = require("graphql-upload");
const constants_1 = require("../../common/constants");
const generated_graphql_admin_errors_1 = require("../../common/error/generated-graphql-admin-errors");
const generated_graphql_shop_errors_1 = require("../../common/error/generated-graphql-shop-errors");
/**
 * @description
 * Generates additional resolvers required for things like resolution of union types,
 * custom scalars and "relation"-type custom fields.
 */
function generateResolvers(configService, customFieldRelationResolverService, apiType, schema) {
    // Prevent `Type "Node" is missing a "resolveType" resolver.` warnings.
    // See https://github.com/apollographql/apollo-server/issues/1075
    const dummyResolveType = {
        __resolveType() {
            return null;
        },
    };
    const stockMovementResolveType = {
        __resolveType(value) {
            switch (value.type) {
                case generated_types_1.StockMovementType.ADJUSTMENT:
                    return 'StockAdjustment';
                case generated_types_1.StockMovementType.ALLOCATION:
                    return 'Allocation';
                case generated_types_1.StockMovementType.SALE:
                    return 'Sale';
                case generated_types_1.StockMovementType.CANCELLATION:
                    return 'Cancellation';
                case generated_types_1.StockMovementType.RETURN:
                    return 'Return';
                case generated_types_1.StockMovementType.RELEASE:
                    return 'Release';
            }
        },
    };
    const customFieldsConfigResolveType = {
        __resolveType(value) {
            switch (value.type) {
                case 'string':
                    return 'StringCustomFieldConfig';
                case 'localeString':
                    return 'LocaleStringCustomFieldConfig';
                case 'text':
                    return 'TextCustomFieldConfig';
                case 'int':
                    return 'IntCustomFieldConfig';
                case 'float':
                    return 'FloatCustomFieldConfig';
                case 'boolean':
                    return 'BooleanCustomFieldConfig';
                case 'datetime':
                    return 'DateTimeCustomFieldConfig';
                case 'relation':
                    return 'RelationCustomFieldConfig';
            }
        },
    };
    const commonResolvers = {
        JSON: graphql_scalars_1.GraphQLJSON,
        DateTime: graphql_scalars_1.GraphQLDateTime,
        Node: dummyResolveType,
        PaginatedList: dummyResolveType,
        Upload: graphql_upload_1.GraphQLUpload || dummyResolveType,
        SearchResultPrice: {
            __resolveType(value) {
                return value.hasOwnProperty('value') ? 'SinglePrice' : 'PriceRange';
            },
        },
        CustomFieldConfig: customFieldsConfigResolveType,
        CustomField: customFieldsConfigResolveType,
        ErrorResult: {
            __resolveType(value) {
                return value.__typename;
            },
        },
    };
    const customFieldRelationResolvers = generateCustomFieldRelationResolvers(configService, customFieldRelationResolverService, schema);
    const adminResolvers = Object.assign(Object.assign({ StockMovementItem: stockMovementResolveType, StockMovement: stockMovementResolveType }, generated_graphql_admin_errors_1.adminErrorOperationTypeResolvers), customFieldRelationResolvers.adminResolvers);
    const shopResolvers = Object.assign(Object.assign({}, generated_graphql_shop_errors_1.shopErrorOperationTypeResolvers), customFieldRelationResolvers.shopResolvers);
    const resolvers = apiType === 'admin'
        ? Object.assign(Object.assign({}, commonResolvers), adminResolvers) : Object.assign(Object.assign({}, commonResolvers), shopResolvers);
    return resolvers;
}
exports.generateResolvers = generateResolvers;
/**
 * @description
 * Based on the CustomFields config, this function dynamically creates resolver functions to perform
 * a DB query to fetch the related entity for any custom fields of type "relation".
 */
function generateCustomFieldRelationResolvers(configService, customFieldRelationResolverService, schema) {
    const ENTITY_ID_KEY = '__entityId__';
    const adminResolvers = {};
    const shopResolvers = {};
    for (const [entityName, customFields] of Object.entries(configService.customFields)) {
        const relationCustomFields = customFields.filter(isRelationalType);
        if (relationCustomFields.length === 0 || !schema.getType(entityName)) {
            continue;
        }
        const customFieldTypeName = `${entityName}CustomFields`;
        // Some types are not exposed in the Shop API and therefore defining resolvers
        // for them would lead to an Apollo error on bootstrap.
        const excludeFromShopApi = ['GlobalSettings'].includes(entityName);
        // In order to resolve the relations in the CustomFields type, we need
        // access to the entity id. Therefore we attach it to the resolved value
        // so that it is available to the `relationResolver` below.
        const customFieldResolver = (source) => {
            return Object.assign(Object.assign({}, source.customFields), { [ENTITY_ID_KEY]: source.id });
        };
        adminResolvers[entityName] = {
            customFields: customFieldResolver,
        };
        if (!excludeFromShopApi) {
            shopResolvers[entityName] = {
                customFields: customFieldResolver,
            };
        }
        for (const fieldDef of relationCustomFields) {
            const relationResolver = async (source, args, context) => {
                if (source[fieldDef.name] != null) {
                    return source[fieldDef.name];
                }
                const ctx = context.req[constants_1.REQUEST_CONTEXT_KEY];
                const entityId = source[ENTITY_ID_KEY];
                return customFieldRelationResolverService.resolveRelation({
                    ctx,
                    fieldDef,
                    entityName,
                    entityId,
                });
            };
            adminResolvers[customFieldTypeName] = Object.assign(Object.assign({}, adminResolvers[customFieldTypeName]), { [fieldDef.name]: relationResolver });
            if (fieldDef.public !== false && !excludeFromShopApi) {
                shopResolvers[customFieldTypeName] = Object.assign(Object.assign({}, shopResolvers[customFieldTypeName]), { [fieldDef.name]: relationResolver });
            }
        }
    }
    return { adminResolvers, shopResolvers };
}
function isRelationalType(input) {
    return input.type === 'relation';
}
function isTranslatable(input) {
    return typeof input === 'object' && input != null && input.hasOwnProperty('translations');
}
//# sourceMappingURL=generate-resolvers.js.map