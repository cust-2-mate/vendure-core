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
exports.ValidateCustomFieldsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const graphql_2 = require("graphql");
const constants_1 = require("../../common/constants");
const injector_1 = require("../../common/injector");
const config_service_1 = require("../../config/config.service");
const parse_context_1 = require("../common/parse-context");
const validate_custom_field_value_1 = require("../common/validate-custom-field-value");
/**
 * This interceptor is responsible for enforcing the validation constraints defined for any CustomFields.
 * For example, if a custom 'int' field has a "min" value of 0, and a mutation attempts to set its value
 * to a negative integer, then that mutation will fail with an error.
 */
let ValidateCustomFieldsInterceptor = class ValidateCustomFieldsInterceptor {
    constructor(configService, moduleRef) {
        this.configService = configService;
        this.moduleRef = moduleRef;
        this.inputsWithCustomFields = Object.keys(configService.customFields).reduce((inputs, entityName) => {
            inputs.add(`Create${entityName}Input`);
            inputs.add(`Update${entityName}Input`);
            return inputs;
        }, new Set());
    }
    async intercept(context, next) {
        const parsedContext = parse_context_1.parseContext(context);
        const injector = new injector_1.Injector(this.moduleRef);
        if (parsedContext.isGraphQL) {
            const gqlExecutionContext = graphql_1.GqlExecutionContext.create(context);
            const { operation, schema } = parsedContext.info;
            const variables = gqlExecutionContext.getArgs();
            const ctx = parsedContext.req[constants_1.REQUEST_CONTEXT_KEY];
            if (operation.operation === 'mutation') {
                const inputTypeNames = this.getArgumentMap(operation, schema);
                for (const [inputName, typeName] of Object.entries(inputTypeNames)) {
                    if (this.inputsWithCustomFields.has(typeName)) {
                        if (variables[inputName]) {
                            const inputVariables = Array.isArray(variables[inputName])
                                ? variables[inputName]
                                : [variables[inputName]];
                            for (const inputVariable of inputVariables) {
                                await this.validateInput(typeName, ctx.languageCode, injector, inputVariable);
                            }
                        }
                    }
                }
            }
        }
        return next.handle();
    }
    async validateInput(typeName, languageCode, injector, variableValues) {
        if (variableValues) {
            const entityName = typeName.replace(/(Create|Update)(.+)Input/, '$2');
            const customFieldConfig = this.configService.customFields[entityName];
            if (variableValues.customFields) {
                await this.validateCustomFieldsObject(customFieldConfig, languageCode, variableValues.customFields, injector);
            }
            const translations = variableValues.translations;
            if (Array.isArray(translations)) {
                for (const translation of translations) {
                    if (translation.customFields) {
                        await this.validateCustomFieldsObject(customFieldConfig, languageCode, translation.customFields, injector);
                    }
                }
            }
        }
    }
    async validateCustomFieldsObject(customFieldConfig, languageCode, customFieldsObject, injector) {
        for (const [key, value] of Object.entries(customFieldsObject)) {
            const config = customFieldConfig.find(c => shared_utils_1.getGraphQlInputName(c) === key);
            if (config) {
                await validate_custom_field_value_1.validateCustomFieldValue(config, value, injector, languageCode);
            }
        }
    }
    getArgumentMap(operation, schema) {
        const mutationType = schema.getMutationType();
        if (!mutationType) {
            return {};
        }
        const map = {};
        for (const selection of operation.selectionSet.selections) {
            if (selection.kind === 'Field') {
                const name = selection.name.value;
                const inputType = mutationType.getFields()[name];
                for (const arg of inputType.args) {
                    map[arg.name] = this.getInputTypeName(arg.type);
                }
            }
        }
        return map;
    }
    getNamedTypeName(type) {
        if (type.kind === 'NonNullType' || type.kind === 'ListType') {
            return this.getNamedTypeName(type.type);
        }
        else {
            return type.name.value;
        }
    }
    getInputTypeName(type) {
        if (type instanceof graphql_2.GraphQLNonNull) {
            return this.getInputTypeName(type.ofType);
        }
        if (type instanceof graphql_2.GraphQLList) {
            return this.getInputTypeName(type.ofType);
        }
        return type.name;
    }
};
ValidateCustomFieldsInterceptor = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService, core_1.ModuleRef])
], ValidateCustomFieldsInterceptor);
exports.ValidateCustomFieldsInterceptor = ValidateCustomFieldsInterceptor;
//# sourceMappingURL=validate-custom-fields-interceptor.js.map