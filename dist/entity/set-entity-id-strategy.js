"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setEntityIdStrategy = void 0;
const typeorm_1 = require("typeorm");
const entity_id_decorator_1 = require("./entity-id.decorator");
function setEntityIdStrategy(entityIdStrategy, entities) {
    setBaseEntityIdType(entityIdStrategy);
    setEntityIdColumnTypes(entityIdStrategy, entities);
}
exports.setEntityIdStrategy = setEntityIdStrategy;
function setEntityIdColumnTypes(entityIdStrategy, entities) {
    const columnDataType = entityIdStrategy.primaryKeyType === 'increment' ? 'int' : 'varchar';
    for (const EntityCtor of entities) {
        const columnConfig = entity_id_decorator_1.getIdColumnsFor(EntityCtor);
        for (const { name, options, entity } of columnConfig) {
            typeorm_1.Column({
                type: columnDataType,
                nullable: (options && options.nullable) || false,
                primary: (options && options.primary) || false,
            })(entity, name);
        }
    }
}
function setBaseEntityIdType(entityIdStrategy) {
    const { entity, name } = entity_id_decorator_1.getPrimaryGeneratedIdColumn();
    typeorm_1.PrimaryGeneratedColumn(entityIdStrategy.primaryKeyType)(entity, name);
}
//# sourceMappingURL=set-entity-id-strategy.js.map