/// <reference types="node" />
import { AssetListOptions, AssignAssetsToChannelInput, CreateAssetInput, CreateAssetResult, DeletionResponse, UpdateAssetInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { ReadStream } from 'fs-extra';
import { Readable } from 'stream';
import { RequestContext } from '../../api/common/request-context';
import { ConfigService } from '../../config/config.service';
import { Asset } from '../../entity/asset/asset.entity';
import { OrderableAsset } from '../../entity/asset/orderable-asset.entity';
import { VendureEntity } from '../../entity/base/base.entity';
import { EventBus } from '../../event-bus/event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';
import { TransactionalConnection } from '../transaction/transactional-connection';
import { ChannelService } from './channel.service';
import { RoleService } from './role.service';
import { TagService } from './tag.service';
export interface EntityWithAssets extends VendureEntity {
    featuredAsset: Asset | null;
    assets: OrderableAsset[];
}
export interface EntityAssetInput {
    assetIds?: ID[] | null;
    featuredAssetId?: ID | null;
}
export declare class AssetService {
    private connection;
    private configService;
    private listQueryBuilder;
    private eventBus;
    private tagService;
    private channelService;
    private roleService;
    private customFieldRelationService;
    private permittedMimeTypes;
    constructor(connection: TransactionalConnection, configService: ConfigService, listQueryBuilder: ListQueryBuilder, eventBus: EventBus, tagService: TagService, channelService: ChannelService, roleService: RoleService, customFieldRelationService: CustomFieldRelationService);
    findOne(ctx: RequestContext, id: ID): Promise<Asset | undefined>;
    findAll(ctx: RequestContext, options?: AssetListOptions): Promise<PaginatedList<Asset>>;
    getFeaturedAsset<T extends Omit<EntityWithAssets, 'assets'>>(ctx: RequestContext, entity: T): Promise<Asset | undefined>;
    getEntityAssets<T extends EntityWithAssets>(ctx: RequestContext, entity: T): Promise<Asset[] | undefined>;
    updateFeaturedAsset<T extends EntityWithAssets>(ctx: RequestContext, entity: T, input: EntityAssetInput): Promise<T>;
    /**
     * Updates the assets / featuredAsset of an entity, ensuring that only valid assetIds are used.
     */
    updateEntityAssets<T extends EntityWithAssets>(ctx: RequestContext, entity: T, input: EntityAssetInput): Promise<T>;
    /**
     * Create an Asset based on a file uploaded via the GraphQL API.
     */
    create(ctx: RequestContext, input: CreateAssetInput): Promise<CreateAssetResult>;
    update(ctx: RequestContext, input: UpdateAssetInput): Promise<Asset>;
    delete(ctx: RequestContext, ids: ID[], force?: boolean, deleteFromAllChannels?: boolean): Promise<DeletionResponse>;
    assignToChannel(ctx: RequestContext, input: AssignAssetsToChannelInput): Promise<Asset[]>;
    /**
     * Create an Asset from a file stream created during data import.
     */
    createFromFileStream(stream: ReadStream): Promise<CreateAssetResult>;
    createFromFileStream(stream: Readable, filePath: string): Promise<CreateAssetResult>;
    /**
     * Unconditionally delete given assets.
     * Does not remove assets from channels
     */
    private deleteUnconditional;
    /**
     * Check if current user has permissions to delete assets from all channels
     */
    private hasDeletePermissionForChannels;
    private createAssetInternal;
    private getSourceFileName;
    private getPreviewFileName;
    private generateUniqueName;
    private getDimensions;
    private createOrderableAssets;
    private getOrderableAsset;
    private removeExistingOrderableAssets;
    private getOrderableAssetType;
    private getHostEntityIdProperty;
    private validateMimeType;
    /**
     * Find the entities which reference the given Asset as a featuredAsset.
     */
    private findAssetUsages;
}
