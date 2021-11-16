"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetEvent = void 0;
const vendure_event_1 = require("../vendure-event");
/**
 * @description
 * This event is fired whenever aa {@link Asset} is added, updated
 * or deleted.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
class AssetEvent extends vendure_event_1.VendureEvent {
    constructor(ctx, asset, type) {
        super();
        this.ctx = ctx;
        this.asset = asset;
        this.type = type;
    }
}
exports.AssetEvent = AssetEvent;
//# sourceMappingURL=asset-event.js.map