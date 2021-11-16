import { ApolloServerPlugin, GraphQLRequestListener, GraphQLServiceContext } from 'apollo-server-plugin-base';
import { ConfigService } from '../../config/config.service';
/**
 * Transforms outputs so that any Asset instances are run through the {@link AssetStorageStrategy.toAbsoluteUrl}
 * method before being returned in the response.
 */
export declare class AssetInterceptorPlugin implements ApolloServerPlugin {
    private configService;
    private graphqlValueTransformer;
    private readonly toAbsoluteUrl;
    constructor(configService: ConfigService);
    serverWillStart(service: GraphQLServiceContext): Promise<void> | void;
    requestDidStart(): GraphQLRequestListener;
    private prefixAssetUrls;
    private isAssetType;
}
