"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdCodecPlugin = void 0;
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const graphql_value_transformer_1 = require("../common/graphql-value-transformer");
/**
 * Encodes the ids of outgoing responses according to the configured EntityIdStrategy.
 *
 * This is done here and not via a Nest Interceptor because it's not possible
 * according to https://github.com/nestjs/graphql/issues/320
 */
class IdCodecPlugin {
    constructor(idCodecService) {
        this.idCodecService = idCodecService;
    }
    serverWillStart(service) {
        this.graphqlValueTransformer = new graphql_value_transformer_1.GraphqlValueTransformer(service.schema);
    }
    requestDidStart() {
        return {
            willSendResponse: requestContext => {
                const { document } = requestContext;
                if (document) {
                    const data = requestContext.response.data;
                    if (data) {
                        this.encodeIdFields(document, data);
                    }
                }
            },
        };
    }
    encodeIdFields(document, data) {
        const typeTree = this.graphqlValueTransformer.getOutputTypeTree(document);
        this.graphqlValueTransformer.transformValues(typeTree, data, (value, type) => {
            const isIdType = type && type.name === 'ID';
            if (type && type.name === 'JSON' && shared_utils_1.isObject(value)) {
                return this.idCodecService.encode(value, [
                    'paymentId',
                    'fulfillmentId',
                    'orderItemIds',
                    'promotionId',
                    'refundId',
                    'groupId',
                    'modificationId',
                ]);
            }
            return isIdType ? this.idCodecService.encode(value) : value;
        });
    }
}
exports.IdCodecPlugin = IdCodecPlugin;
//# sourceMappingURL=id-codec-plugin.js.map