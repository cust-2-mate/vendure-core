"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPaymentMethodQuoteCustomFields = exports.addShippingMethodQuoteCustomFields = exports.addOrderLineCustomFieldsInput = exports.addModifyOrderCustomFields = exports.addRegisterCustomerCustomFieldsInput = exports.addActiveAdministratorCustomFields = exports.addServerConfigCustomFields = exports.addGraphQLCustomFields = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const graphql_1 = require("graphql");
/**
 * Given a CustomFields config object, generates an SDL string extending the built-in
 * types with a customFields property for all entities, translations and inputs for which
 * custom fields are defined.
 */
function addGraphQLCustomFields(typeDefsOrSchema, customFieldConfig, publicOnly) {
    var _a;
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    let customFieldTypeDefs = '';
    if (!schema.getType('JSON')) {
        customFieldTypeDefs += `
            scalar JSON
        `;
    }
    if (!schema.getType('DateTime')) {
        customFieldTypeDefs += `
            scalar DateTime
        `;
    }
    for (const entityName of Object.keys(customFieldConfig)) {
        const customEntityFields = (customFieldConfig[entityName] || []).filter(config => {
            return !config.internal && (publicOnly === true ? config.public !== false : true);
        });
        for (const fieldDef of customEntityFields) {
            if (fieldDef.type === 'relation') {
                if (!schema.getType(fieldDef.graphQLType || fieldDef.entity.name)) {
                    throw new Error(`The GraphQL type "${fieldDef.graphQLType}" specified by the ${entityName}.${fieldDef.name} custom field does not exist`);
                }
            }
        }
        const localeStringFields = customEntityFields.filter(field => field.type === 'localeString');
        const nonLocaleStringFields = customEntityFields.filter(field => field.type !== 'localeString');
        const writeableLocaleStringFields = localeStringFields.filter(field => !field.readonly);
        const writeableNonLocaleStringFields = nonLocaleStringFields.filter(field => !field.readonly);
        const filterableFields = customEntityFields.filter(field => field.type !== 'relation');
        if (schema.getType(entityName)) {
            if (customEntityFields.length) {
                customFieldTypeDefs += `
                    type ${entityName}CustomFields {
                        ${mapToFields(customEntityFields, getGraphQlType)}
                    }

                    extend type ${entityName} {
                        customFields: ${entityName}CustomFields
                    }
                `;
            }
            else {
                customFieldTypeDefs += `
                    extend type ${entityName} {
                        customFields: JSON
                    }
                `;
            }
        }
        if (localeStringFields.length && schema.getType(`${entityName}Translation`)) {
            customFieldTypeDefs += `
                    type ${entityName}TranslationCustomFields {
                         ${mapToFields(localeStringFields, getGraphQlType)}
                    }

                    extend type ${entityName}Translation {
                        customFields: ${entityName}TranslationCustomFields
                    }
                `;
        }
        if (schema.getType(`Create${entityName}Input`)) {
            if (writeableNonLocaleStringFields.length) {
                customFieldTypeDefs += `
                    input Create${entityName}CustomFieldsInput {
                       ${mapToFields(writeableNonLocaleStringFields, getGraphQlInputType, shared_utils_1.getGraphQlInputName)}
                    }

                    extend input Create${entityName}Input {
                        customFields: Create${entityName}CustomFieldsInput
                    }
                `;
            }
            else {
                customFieldTypeDefs += `
                   extend input Create${entityName}Input {
                       customFields: JSON
                   }
               `;
            }
        }
        if (schema.getType(`Update${entityName}Input`)) {
            if (writeableNonLocaleStringFields.length) {
                customFieldTypeDefs += `
                    input Update${entityName}CustomFieldsInput {
                       ${mapToFields(writeableNonLocaleStringFields, getGraphQlInputType, shared_utils_1.getGraphQlInputName)}
                    }

                    extend input Update${entityName}Input {
                        customFields: Update${entityName}CustomFieldsInput
                    }
                `;
            }
            else {
                customFieldTypeDefs += `
                    extend input Update${entityName}Input {
                        customFields: JSON
                    }
                `;
            }
        }
        if (customEntityFields.length && schema.getType(`${entityName}SortParameter`)) {
            customFieldTypeDefs += `
                    extend input ${entityName}SortParameter {
                         ${mapToFields(customEntityFields, () => 'SortOrder')}
                    }
                `;
        }
        if (filterableFields.length && schema.getType(`${entityName}FilterParameter`)) {
            customFieldTypeDefs += `
                    extend input ${entityName}FilterParameter {
                         ${mapToFields(filterableFields, getFilterOperator)}
                    }
                `;
        }
        if (writeableLocaleStringFields) {
            const translationInputs = [
                `${entityName}TranslationInput`,
                `Create${entityName}TranslationInput`,
                `Update${entityName}TranslationInput`,
            ];
            for (const inputName of translationInputs) {
                if (schema.getType(inputName)) {
                    if (writeableLocaleStringFields.length) {
                        customFieldTypeDefs += `
                            input ${inputName}CustomFields {
                                ${mapToFields(writeableLocaleStringFields, getGraphQlType)}
                            }

                            extend input ${inputName} {
                                customFields: ${inputName}CustomFields
                            }
                        `;
                    }
                    else {
                        customFieldTypeDefs += `
                            extend input ${inputName} {
                                customFields: JSON
                            }
                        `;
                    }
                }
            }
        }
    }
    if ((_a = customFieldConfig.Address) === null || _a === void 0 ? void 0 : _a.length) {
        // For custom fields on the Address entity, we also extend the OrderAddress
        // type (which is used to store address snapshots on Orders)
        if (schema.getType('OrderAddress')) {
            customFieldTypeDefs += `
                extend type OrderAddress {
                    customFields: AddressCustomFields
                }
            `;
        }
        if (schema.getType('UpdateOrderAddressInput')) {
            customFieldTypeDefs += `
                extend input UpdateOrderAddressInput {
                    customFields: UpdateAddressCustomFieldsInput
                }
            `;
        }
    }
    else {
        if (schema.getType('OrderAddress')) {
            customFieldTypeDefs += `
                extend type OrderAddress {
                    customFields: JSON
                }
        `;
        }
    }
    return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
}
exports.addGraphQLCustomFields = addGraphQLCustomFields;
function addServerConfigCustomFields(typeDefsOrSchema, customFieldConfig) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    const customFieldTypeDefs = `
            type CustomFields {
                ${Object.keys(customFieldConfig).reduce((output, name) => output + name + `: [CustomFieldConfig!]!\n`, '')}
            }

            extend type ServerConfig {
                customFieldConfig: CustomFields!
            }
        `;
    return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
}
exports.addServerConfigCustomFields = addServerConfigCustomFields;
function addActiveAdministratorCustomFields(typeDefsOrSchema, administratorCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    const extension = `
        extend input UpdateActiveAdministratorInput {
            customFields: ${0 < (administratorCustomFields === null || administratorCustomFields === void 0 ? void 0 : administratorCustomFields.length) ? 'UpdateAdministratorCustomFieldsInput' : 'JSON'}
        }
    `;
    return graphql_1.extendSchema(schema, graphql_1.parse(extension));
}
exports.addActiveAdministratorCustomFields = addActiveAdministratorCustomFields;
/**
 * If CustomFields are defined on the Customer entity, then an extra `customFields` field is added to
 * the `RegisterCustomerInput` so that public writable custom fields can be set when a new customer
 * is registered.
 */
function addRegisterCustomerCustomFieldsInput(typeDefsOrSchema, customerCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    if (!customerCustomFields || customerCustomFields.length === 0) {
        return schema;
    }
    const publicWritableCustomFields = customerCustomFields.filter(fieldDef => {
        return fieldDef.public !== false && !fieldDef.readonly && !fieldDef.internal;
    });
    if (publicWritableCustomFields.length < 1) {
        return schema;
    }
    const customFieldTypeDefs = `
        input RegisterCustomerCustomFieldsInput {
            ${mapToFields(publicWritableCustomFields, getGraphQlInputType, shared_utils_1.getGraphQlInputName)}
        }

        extend input RegisterCustomerInput {
            customFields: RegisterCustomerCustomFieldsInput
        }
    `;
    return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
}
exports.addRegisterCustomerCustomFieldsInput = addRegisterCustomerCustomFieldsInput;
/**
 * If CustomFields are defined on the Order entity, we add a `customFields` field to the ModifyOrderInput
 * type.
 */
function addModifyOrderCustomFields(typeDefsOrSchema, orderCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    if (!orderCustomFields || orderCustomFields.length === 0) {
        return schema;
    }
    if (schema.getType('ModifyOrderInput') && schema.getType('UpdateOrderCustomFieldsInput')) {
        const customFieldTypeDefs = `
                extend input ModifyOrderInput {
                    customFields: UpdateOrderCustomFieldsInput
                }
            `;
        return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
    }
    return schema;
}
exports.addModifyOrderCustomFields = addModifyOrderCustomFields;
/**
 * If CustomFields are defined on the OrderLine entity, then an extra `customFields` argument
 * must be added to the `addItemToOrder` and `adjustOrderLine` mutations, as well as the related
 * fields in the `ModifyOrderInput` type.
 */
function addOrderLineCustomFieldsInput(typeDefsOrSchema, orderLineCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    const publicCustomFields = orderLineCustomFields.filter(f => f.public !== false);
    if (!publicCustomFields || publicCustomFields.length === 0) {
        return schema;
    }
    const schemaConfig = schema.toConfig();
    const mutationType = schemaConfig.mutation;
    if (!mutationType) {
        return schema;
    }
    const input = new graphql_1.GraphQLInputObjectType({
        name: 'OrderLineCustomFieldsInput',
        fields: publicCustomFields.reduce((fields, field) => {
            const name = shared_utils_1.getGraphQlInputName(field);
            // tslint:disable-next-line:no-non-null-assertion
            const primitiveType = schema.getType(getGraphQlInputType(field));
            const type = field.list === true ? new graphql_1.GraphQLList(primitiveType) : primitiveType;
            return Object.assign(Object.assign({}, fields), { [name]: { type } });
        }, {}),
    });
    schemaConfig.types.push(input);
    const addItemToOrderMutation = mutationType.getFields().addItemToOrder;
    const adjustOrderLineMutation = mutationType.getFields().adjustOrderLine;
    if (addItemToOrderMutation) {
        addItemToOrderMutation.args.push({
            name: 'customFields',
            type: input,
            description: null,
            defaultValue: null,
            extensions: null,
            astNode: null,
            deprecationReason: null,
        });
    }
    if (adjustOrderLineMutation) {
        adjustOrderLineMutation.args.push({
            name: 'customFields',
            type: input,
            description: null,
            defaultValue: null,
            extensions: null,
            astNode: null,
            deprecationReason: null,
        });
    }
    let extendedSchema = new graphql_1.GraphQLSchema(schemaConfig);
    if (schema.getType('AddItemInput')) {
        const customFieldTypeDefs = `
            extend input AddItemInput {
                customFields: OrderLineCustomFieldsInput
            }
        `;
        extendedSchema = graphql_1.extendSchema(extendedSchema, graphql_1.parse(customFieldTypeDefs));
    }
    if (schema.getType('AdjustOrderLineInput')) {
        const customFieldTypeDefs = `
            extend input AdjustOrderLineInput {
                customFields: OrderLineCustomFieldsInput
            }
        `;
        extendedSchema = graphql_1.extendSchema(extendedSchema, graphql_1.parse(customFieldTypeDefs));
    }
    return extendedSchema;
}
exports.addOrderLineCustomFieldsInput = addOrderLineCustomFieldsInput;
function addShippingMethodQuoteCustomFields(typeDefsOrSchema, shippingMethodCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    let customFieldTypeDefs = ``;
    const publicCustomFields = shippingMethodCustomFields.filter(f => f.public !== false);
    if (0 < publicCustomFields.length) {
        customFieldTypeDefs = `
            extend type ShippingMethodQuote {
                customFields: ShippingMethodCustomFields
            }
        `;
    }
    else {
        customFieldTypeDefs = `
            extend type ShippingMethodQuote {
                customFields: JSON
            }
        `;
    }
    return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
}
exports.addShippingMethodQuoteCustomFields = addShippingMethodQuoteCustomFields;
function addPaymentMethodQuoteCustomFields(typeDefsOrSchema, paymentMethodCustomFields) {
    const schema = typeof typeDefsOrSchema === 'string' ? graphql_1.buildSchema(typeDefsOrSchema) : typeDefsOrSchema;
    let customFieldTypeDefs = ``;
    const publicCustomFields = paymentMethodCustomFields.filter(f => f.public !== false);
    if (0 < publicCustomFields.length) {
        customFieldTypeDefs = `
            extend type PaymentMethodQuote {
                customFields: PaymentMethodCustomFields
            }
        `;
    }
    else {
        customFieldTypeDefs = `
            extend type PaymentMethodQuote {
                customFields: JSON
            }
        `;
    }
    return graphql_1.extendSchema(schema, graphql_1.parse(customFieldTypeDefs));
}
exports.addPaymentMethodQuoteCustomFields = addPaymentMethodQuoteCustomFields;
/**
 * Maps an array of CustomFieldConfig objects into a string of SDL fields.
 */
function mapToFields(fieldDefs, typeFn, nameFn) {
    const res = fieldDefs
        .map(field => {
        const primitiveType = typeFn(field);
        if (!primitiveType) {
            return;
        }
        const finalType = field.list ? `[${primitiveType}!]` : primitiveType;
        const name = nameFn ? nameFn(field) : field.name;
        return `${name}: ${finalType}`;
    })
        .filter(x => x != null);
    return res.join('\n');
}
function getFilterOperator(config) {
    switch (config.type) {
        case 'datetime':
            return 'DateOperators';
        case 'string':
        case 'localeString':
        case 'text':
            return 'StringOperators';
        case 'boolean':
            return 'BooleanOperators';
        case 'int':
        case 'float':
            return 'NumberOperators';
        case 'relation':
            return undefined;
        default:
            shared_utils_1.assertNever(config);
    }
    return 'String';
}
function getGraphQlInputType(config) {
    return config.type === 'relation' ? `ID` : getGraphQlType(config);
}
function getGraphQlType(config) {
    switch (config.type) {
        case 'string':
        case 'localeString':
        case 'text':
            return 'String';
        case 'datetime':
            return 'DateTime';
        case 'boolean':
            return 'Boolean';
        case 'int':
            return 'Int';
        case 'float':
            return 'Float';
        case 'relation':
            return config.graphQLType || config.entity.name;
        default:
            shared_utils_1.assertNever(config);
    }
    return 'String';
}
//# sourceMappingURL=graphql-custom-fields.js.map