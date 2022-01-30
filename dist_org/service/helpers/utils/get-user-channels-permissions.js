"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChannelsPermissions = void 0;
const unique_1 = require("@vendure/common/lib/unique");
/**
 * Returns an array of Channels and permissions on those Channels for the given User.
 */
function getUserChannelsPermissions(user) {
    const channelsMap = {};
    for (const role of user.roles) {
        for (const channel of role.channels) {
            if (!channelsMap[channel.code]) {
                channelsMap[channel.code] = {
                    id: channel.id,
                    token: channel.token,
                    code: channel.code,
                    permissions: [],
                };
            }
            channelsMap[channel.code].permissions = unique_1.unique([
                ...channelsMap[channel.code].permissions,
                ...role.permissions,
            ]);
        }
    }
    return Object.values(channelsMap).sort((a, b) => (a.id < b.id ? -1 : 1));
}
exports.getUserChannelsPermissions = getUserChannelsPermissions;
//# sourceMappingURL=get-user-channels-permissions.js.map