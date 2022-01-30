"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslateErrorsPlugin = void 0;
/**
 * This plugin intercepts outgoing responses and translates any error messages into the
 * current request language.
 */
class TranslateErrorsPlugin {
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    requestDidStart() {
        return {
            willSendResponse: requestContext => {
                const { errors, context } = requestContext;
                if (errors) {
                    requestContext.response.errors = errors.map(err => {
                        return this.i18nService.translateError(context.req, err);
                    });
                }
            },
        };
    }
}
exports.TranslateErrorsPlugin = TranslateErrorsPlugin;
//# sourceMappingURL=translate-errors-plugin.js.map