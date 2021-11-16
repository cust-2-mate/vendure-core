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
exports.ListQueryBuilder = void 0;
const common_1 = require("@nestjs/common");
const unique_1 = require("@vendure/common/lib/unique");
const typeorm_1 = require("typeorm");
const FindOptionsUtils_1 = require("typeorm/find-options/FindOptionsUtils");
const errors_1 = require("../../../common/error/errors");
const config_service_1 = require("../../../config/config.service");
const vendure_logger_1 = require("../../../config/logger/vendure-logger");
const transactional_connection_1 = require("../../transaction/transactional-connection");
const connection_utils_1 = require("./connection-utils");
const get_calculated_columns_1 = require("./get-calculated-columns");
const parse_channel_param_1 = require("./parse-channel-param");
const parse_filter_params_1 = require("./parse-filter-params");
const parse_sort_params_1 = require("./parse-sort-params");
let ListQueryBuilder = class ListQueryBuilder {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
    onApplicationBootstrap() {
        this.registerSQLiteRegexpFunction();
    }
    /**
     * Creates and configures a SelectQueryBuilder for queries that return paginated lists of entities.
     */
    build(entity, options = {}, extendedOptions = {}) {
        var _a, _b;
        const apiType = (_b = (_a = extendedOptions.ctx) === null || _a === void 0 ? void 0 : _a.apiType) !== null && _b !== void 0 ? _b : 'shop';
        const rawConnection = this.connection.rawConnection;
        const { take, skip } = this.parseTakeSkipParams(apiType, options);
        const repo = extendedOptions.ctx
            ? this.connection.getRepository(extendedOptions.ctx, entity)
            : this.connection.getRepository(entity);
        const qb = repo.createQueryBuilder(entity.name.toLowerCase());
        FindOptionsUtils_1.FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
            relations: extendedOptions.relations,
            take,
            skip,
            where: extendedOptions.where || {},
        });
        // tslint:disable-next-line:no-non-null-assertion
        FindOptionsUtils_1.FindOptionsUtils.joinEagerRelations(qb, qb.alias, qb.expressionMap.mainAlias.metadata);
        //this.applyTranslationConditions(qb, entity, extendedOptions.ctx);
        // join the tables required by calculated columns
        this.joinCalculatedColumnRelations(qb, entity, options);
        const { customPropertyMap } = extendedOptions;
        if (customPropertyMap) {
            this.normalizeCustomPropertyMap(customPropertyMap, qb);
        }
        const sort = parse_sort_params_1.parseSortParams(rawConnection, entity, Object.assign({}, options.sort, extendedOptions.orderBy), customPropertyMap);
        const filter = parse_filter_params_1.parseFilterParams(rawConnection, entity, options.filter, customPropertyMap);
        filter.forEach(({ clause, parameters }) => {
            qb.andWhere(clause, parameters);
        });
        if (extendedOptions.channelId) {
            const channelFilter = parse_channel_param_1.parseChannelParam(rawConnection, entity, extendedOptions.channelId);
            if (channelFilter) {
                qb.andWhere(channelFilter.clause, channelFilter.parameters);
            }
        }
        qb.orderBy(sort);
        return qb;
    }
    parseTakeSkipParams(apiType, options) {
        var _a, _b;
        const { shopListQueryLimit, adminListQueryLimit } = this.configService.apiOptions;
        const takeLimit = apiType === 'admin' ? adminListQueryLimit : shopListQueryLimit;
        if (options.take && options.take > takeLimit) {
            throw new errors_1.UserInputError('error.list-query-limit-exceeded', { limit: takeLimit });
        }
        const rawConnection = this.connection.rawConnection;
        const skip = Math.max((_a = options.skip) !== null && _a !== void 0 ? _a : 0, 0);
        // `take` must not be negative, and must not be greater than takeLimit
        let take = Math.min(Math.max((_b = options.take) !== null && _b !== void 0 ? _b : 0, 0), takeLimit) || takeLimit;
        if (options.skip !== undefined && options.take === undefined) {
            take = takeLimit;
        }
        return { take, skip };
    }
    /**
     * If a customPropertyMap is provided, we need to take the path provided and convert it to the actual
     * relation aliases being used by the SelectQueryBuilder.
     *
     * This method mutates the customPropertyMap object.
     */
    normalizeCustomPropertyMap(customPropertyMap, qb) {
        for (const [key, value] of Object.entries(customPropertyMap)) {
            const parts = customPropertyMap[key].split('.');
            const entityPart = 2 <= parts.length ? parts[parts.length - 2] : qb.alias;
            const columnPart = parts[parts.length - 1];
            const relationAlias = qb.expressionMap.aliases.find(a => a.metadata.tableNameWithoutPrefix === entityPart);
            if (relationAlias) {
                customPropertyMap[key] = `${relationAlias.name}.${columnPart}`;
            }
            else {
                vendure_logger_1.Logger.error(`The customPropertyMap entry "${key}:${value}" could not be resolved to a related table`);
                delete customPropertyMap[key];
            }
        }
    }
    /**
     * Some calculated columns (those with the `@Calculated()` decorator) require extra joins in order
     * to derive the data needed for their expressions.
     */
    joinCalculatedColumnRelations(qb, entity, options) {
        const calculatedColumns = get_calculated_columns_1.getCalculatedColumns(entity);
        const filterAndSortFields = unique_1.unique([
            ...Object.keys(options.filter || {}),
            ...Object.keys(options.sort || {}),
        ]);
        const alias = connection_utils_1.getEntityAlias(this.connection.rawConnection, entity);
        for (const field of filterAndSortFields) {
            const calculatedColumnDef = calculatedColumns.find(c => c.name === field);
            const instruction = calculatedColumnDef === null || calculatedColumnDef === void 0 ? void 0 : calculatedColumnDef.listQuery;
            if (instruction) {
                const relations = instruction.relations || [];
                for (const relation of relations) {
                    const relationIsAlreadyJoined = qb.expressionMap.joinAttributes.find(ja => ja.entityOrProperty === `${alias}.${relation}`);
                    if (!relationIsAlreadyJoined) {
                        const propertyPath = relation.includes('.') ? relation : `${alias}.${relation}`;
                        const relationAlias = relation.includes('.')
                            ? relation.split('.').reverse()[0]
                            : relation;
                        qb.innerJoinAndSelect(propertyPath, relationAlias);
                    }
                }
                if (typeof instruction.query === 'function') {
                    instruction.query(qb);
                }
            }
        }
    }
    /**
     * If this entity is Translatable, then we need to apply appropriate WHERE clauses to limit
     * the joined translation relations. This method applies a simple "WHERE" on the languageCode
     * in the case of the default language, otherwise we use a more complex.
     */
    applyTranslationConditions(qb, entity, ctx) {
        const languageCode = (ctx === null || ctx === void 0 ? void 0 : ctx.languageCode) || this.configService.defaultLanguageCode;
        const { columns, translationColumns, alias } = connection_utils_1.getColumnMetadata(this.connection.rawConnection, entity);
        if (translationColumns.length) {
            const translationsAlias = qb.connection.namingStrategy.eagerJoinRelationAlias(alias, 'translations');
            qb.andWhere(new typeorm_1.Brackets(qb1 => {
                qb1.where(`${translationsAlias}.languageCode = :languageCode`, { languageCode });
                if (languageCode !== this.configService.defaultLanguageCode) {
                    // If the current languageCode is not the default, then we create a more
                    // complex WHERE clause to allow us to use the non-default translations and
                    // fall back to the default language if no translation exists.
                    qb1.orWhere(new typeorm_1.Brackets(qb2 => {
                        const translationEntity = translationColumns[0].entityMetadata.target;
                        const subQb1 = this.connection.rawConnection
                            .createQueryBuilder(translationEntity, 'translation')
                            .where(`translation.base = ${alias}.id`)
                            .andWhere('translation.languageCode = :defaultLanguageCode');
                        const subQb2 = this.connection.rawConnection
                            .createQueryBuilder(translationEntity, 'translation')
                            .where(`translation.base = ${alias}.id`)
                            .andWhere('translation.languageCode = :nonDefaultLanguageCode');
                        qb2.where(`EXISTS (${subQb1.getQuery()})`).andWhere(`NOT EXISTS (${subQb2.getQuery()})`);
                    }));
                }
                else {
                    qb1.orWhere(new typeorm_1.Brackets(qb2 => {
                        const translationEntity = translationColumns[0].entityMetadata.target;
                        const subQb1 = this.connection.rawConnection
                            .createQueryBuilder(translationEntity, 'translation')
                            .where(`translation.base = ${alias}.id`)
                            .andWhere('translation.languageCode = :defaultLanguageCode');
                        const subQb2 = this.connection.rawConnection
                            .createQueryBuilder(translationEntity, 'translation')
                            .where(`translation.base = ${alias}.id`)
                            .andWhere('translation.languageCode != :defaultLanguageCode');
                        qb2.where(`NOT EXISTS (${subQb1.getQuery()})`).andWhere(`EXISTS (${subQb2.getQuery()})`);
                    }));
                }
                qb.setParameters({
                    nonDefaultLanguageCode: languageCode,
                    defaultLanguageCode: this.configService.defaultLanguageCode,
                });
            }));
        }
    }
    /**
     * Registers a user-defined function (for flavors of SQLite driver that support it)
     * so that we can run regex filters on string fields.
     */
    registerSQLiteRegexpFunction() {
        const regexpFn = (pattern, value) => {
            const result = new RegExp(`${pattern}`, 'i').test(value);
            return result ? 1 : 0;
        };
        const dbType = this.connection.rawConnection.options.type;
        if (dbType === 'better-sqlite3') {
            const driver = this.connection.rawConnection.driver;
            driver.databaseConnection.function('regexp', regexpFn);
        }
        if (dbType === 'sqljs') {
            const driver = this.connection.rawConnection.driver;
            driver.databaseConnection.create_function('regexp', regexpFn);
        }
    }
};
ListQueryBuilder = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection, config_service_1.ConfigService])
], ListQueryBuilder);
exports.ListQueryBuilder = ListQueryBuilder;
//# sourceMappingURL=list-query-builder.js.map