"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChannelParam = void 0;
/**
 * Creates a WhereCondition for a channel-aware entity, filtering for only those entities
 * which are assigned to the channel specified by channelId,
 */
function parseChannelParam(connection, entity, channelId) {
    const metadata = connection.getMetadata(entity);
    const alias = metadata.name.toLowerCase();
    const relations = metadata.relations;
    const channelRelation = relations.find(r => r.propertyName === 'channels');
    if (!channelRelation) {
        return;
    }
    return {
        clause: `${alias}__channels.id = :channelId`,
        parameters: { channelId },
    };
}
exports.parseChannelParam = parseChannelParam;
//# sourceMappingURL=parse-channel-param.js.map