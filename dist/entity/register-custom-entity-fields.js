"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomEntityFields = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const typeorm_1 = require("typeorm");
const DateUtils_1 = require("typeorm/util/DateUtils");
const vendure_logger_1 = require("../config/logger/vendure-logger");
const custom_entity_fields_1 = require("./custom-entity-fields");
/**
 * The maximum length of the "length" argument of a MySQL varchar column.
 */
const MAX_STRING_LENGTH = 65535;
/**
 * Dynamically add columns to the custom field entity based on the CustomFields config.
 */
function registerCustomFieldsForEntity(config, entityName, 
// tslint:disable-next-line:callable-types
ctor, translation = false) {
    const customFields = config.customFields && config.customFields[entityName];
    const dbEngine = config.dbConnectionOptions.type;
    if (customFields) {
        for (const customField of customFields) {
            const { name, list, defaultValue, nullable } = customField;
            const instance = new ctor();
            const registerColumn = () => {
                if (customField.type === 'relation') {
                    if (customField.list) {
                        typeorm_1.ManyToMany(type => customField.entity, { eager: customField.eager })(instance, name);
                        typeorm_1.JoinTable()(instance, name);
                    }
                    else {
                        typeorm_1.ManyToOne(type => customField.entity, { eager: customField.eager })(instance, name);
                        typeorm_1.JoinColumn()(instance, name);
                    }
                }
                else {
                    const options = {
                        type: list ? 'simple-json' : getColumnType(dbEngine, customField.type),
                        default: getDefault(customField, dbEngine),
                        name,
                        nullable: nullable === false ? false : true,
                    };
                    if ((customField.type === 'string' || customField.type === 'localeString') && !list) {
                        const length = customField.length || 255;
                        if (MAX_STRING_LENGTH < length) {
                            throw new Error(`ERROR: The "length" property of the custom field "${customField.name}" is greater than the maximum allowed value of ${MAX_STRING_LENGTH}`);
                        }
                        options.length = length;
                    }
                    if (customField.type === 'float') {
                        options.scale = 2;
                    }
                    if (customField.type === 'datetime' &&
                        options.precision == null &&
                        // Setting precision on an sqlite datetime will cause
                        // spurious migration commands. See https://github.com/typeorm/typeorm/issues/2333
                        dbEngine !== 'sqljs' &&
                        dbEngine !== 'sqlite' &&
                        !list) {
                        options.precision = 6;
                    }
                    typeorm_1.Column(options)(instance, name);
                }
            };
            if (translation) {
                if (customField.type === 'localeString') {
                    registerColumn();
                }
            }
            else {
                if (customField.type !== 'localeString') {
                    registerColumn();
                }
            }
            const relationFieldsCount = customFields.filter(f => f.type === 'relation').length;
            const nonLocaleStringFieldsCount = customFields.filter(f => f.type !== 'localeString' && f.type !== 'relation').length;
            if (0 < relationFieldsCount && nonLocaleStringFieldsCount === 0) {
                // if (customFields.filter(f => f.type === 'relation').length === customFields.length) {
                // If there are _only_ relational customFields defined for an Entity, then TypeORM
                // errors when attempting to load that entity ("Cannot set property <fieldName> of undefined").
                // Therefore as a work-around we will add a "fake" column to the customFields embedded type
                // to prevent this error from occurring.
                typeorm_1.Column({
                    type: 'boolean',
                    nullable: true,
                    comment: 'A work-around needed when only relational custom fields are defined on an entity',
                })(instance, '__fix_relational_custom_fields__');
            }
        }
    }
}
function formatDefaultDatetime(dbEngine, datetime) {
    if (!datetime) {
        return datetime;
    }
    switch (dbEngine) {
        case 'sqlite':
        case 'sqljs':
            return DateUtils_1.DateUtils.mixedDateToUtcDatetimeString(datetime);
        case 'mysql':
        case 'postgres':
        default:
            return DateUtils_1.DateUtils.mixedDateToUtcDatetimeString(datetime);
        // return DateUtils.mixedDateToDate(datetime, true, true);
    }
}
function getColumnType(dbEngine, type) {
    switch (type) {
        case 'string':
        case 'localeString':
            return 'varchar';
        case 'text':
            switch (dbEngine) {
                case 'mysql':
                case 'mariadb':
                    return 'longtext';
                default:
                    return 'text';
            }
        case 'boolean':
            switch (dbEngine) {
                case 'mysql':
                    return 'tinyint';
                case 'postgres':
                    return 'bool';
                case 'sqlite':
                case 'sqljs':
                default:
                    return 'boolean';
            }
        case 'int':
            return 'int';
        case 'float':
            return 'double precision';
        case 'datetime':
            switch (dbEngine) {
                case 'postgres':
                    return 'timestamp';
                case 'mysql':
                case 'sqlite':
                case 'sqljs':
                default:
                    return 'datetime';
            }
        default:
            shared_utils_1.assertNever(type);
    }
    return 'varchar';
}
function getDefault(customField, dbEngine) {
    const { name, type, list, defaultValue, nullable } = customField;
    if (list && defaultValue) {
        if (dbEngine === 'mysql') {
            // MySQL does not support defaults on TEXT fields, which is what "simple-json" uses
            // internally. See https://stackoverflow.com/q/3466872/772859
            vendure_logger_1.Logger.warn(`MySQL does not support default values on list fields (${name}). No default will be set.`);
            return undefined;
        }
        return JSON.stringify(defaultValue);
    }
    return type === 'datetime' ? formatDefaultDatetime(dbEngine, defaultValue) : defaultValue;
}
/**
 * Dynamically registers any custom fields with TypeORM. This function should be run at the bootstrap
 * stage of the app lifecycle, before the AppModule is initialized.
 */
function registerCustomEntityFields(config) {
    registerCustomFieldsForEntity(config, 'Address', custom_entity_fields_1.CustomAddressFields);
    registerCustomFieldsForEntity(config, 'Administrator', custom_entity_fields_1.CustomAdministratorFields);
    registerCustomFieldsForEntity(config, 'Asset', custom_entity_fields_1.CustomAssetFields);
    registerCustomFieldsForEntity(config, 'Collection', custom_entity_fields_1.CustomCollectionFields);
    registerCustomFieldsForEntity(config, 'Collection', custom_entity_fields_1.CustomCollectionFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Channel', custom_entity_fields_1.CustomChannelFields);
    registerCustomFieldsForEntity(config, 'Country', custom_entity_fields_1.CustomCountryFields);
    registerCustomFieldsForEntity(config, 'Country', custom_entity_fields_1.CustomCountryFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Customer', custom_entity_fields_1.CustomCustomerFields);
    registerCustomFieldsForEntity(config, 'CustomerGroup', custom_entity_fields_1.CustomCustomerGroupFields);
    registerCustomFieldsForEntity(config, 'Facet', custom_entity_fields_1.CustomFacetFields);
    registerCustomFieldsForEntity(config, 'Facet', custom_entity_fields_1.CustomFacetFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'FacetValue', custom_entity_fields_1.CustomFacetValueFields);
    registerCustomFieldsForEntity(config, 'FacetValue', custom_entity_fields_1.CustomFacetValueFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Fulfillment', custom_entity_fields_1.CustomFulfillmentFields);
    registerCustomFieldsForEntity(config, 'Order', custom_entity_fields_1.CustomOrderFields);
    registerCustomFieldsForEntity(config, 'OrderLine', custom_entity_fields_1.CustomOrderLineFields);
    registerCustomFieldsForEntity(config, 'PaymentMethod', custom_entity_fields_1.CustomPaymentMethodFields);
    registerCustomFieldsForEntity(config, 'Product', custom_entity_fields_1.CustomProductFields);
    registerCustomFieldsForEntity(config, 'Product', custom_entity_fields_1.CustomProductFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'ProductOption', custom_entity_fields_1.CustomProductOptionFields);
    registerCustomFieldsForEntity(config, 'ProductOption', custom_entity_fields_1.CustomProductOptionFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'ProductOptionGroup', custom_entity_fields_1.CustomProductOptionGroupFields);
    registerCustomFieldsForEntity(config, 'ProductOptionGroup', custom_entity_fields_1.CustomProductOptionGroupFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'ProductVariant', custom_entity_fields_1.CustomProductVariantFields);
    registerCustomFieldsForEntity(config, 'ProductVariant', custom_entity_fields_1.CustomProductVariantFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Promotion', custom_entity_fields_1.CustomPromotionFields);
    registerCustomFieldsForEntity(config, 'TaxCategory', custom_entity_fields_1.CustomTaxCategoryFields);
    registerCustomFieldsForEntity(config, 'TaxRate', custom_entity_fields_1.CustomTaxRateFields);
    registerCustomFieldsForEntity(config, 'User', custom_entity_fields_1.CustomUserFields);
    registerCustomFieldsForEntity(config, 'GlobalSettings', custom_entity_fields_1.CustomGlobalSettingsFields);
    registerCustomFieldsForEntity(config, 'ShippingMethod', custom_entity_fields_1.CustomShippingMethodFields);
    registerCustomFieldsForEntity(config, 'ShippingMethod', custom_entity_fields_1.CustomShippingMethodFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Zone', custom_entity_fields_1.CustomZoneFields);
}
exports.registerCustomEntityFields = registerCustomEntityFields;
//# sourceMappingURL=register-custom-entity-fields.js.map