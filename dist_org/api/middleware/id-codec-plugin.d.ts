import { ApolloServerPlugin, GraphQLRequestListener, GraphQLServiceContext } from 'apollo-server-plugin-base';
import { IdCodecService } from '../common/id-codec.service';
/**
 * Encodes the ids of outgoing responses according to the configured EntityIdStrategy.
 *
 * This is done here and not via a Nest Interceptor because it's not possible
 * according to https://github.com/nestjs/graphql/issues/320
 */
export declare class IdCodecPlugin implements ApolloServerPlugin {
    private idCodecService;
    private graphqlValueTransformer;
    constructor(idCodecService: IdCodecService);
    serverWillStart(service: GraphQLServiceContext): Promise<void> | void;
    requestDidStart(): GraphQLRequestListener;
    private encodeIdFields;
}
