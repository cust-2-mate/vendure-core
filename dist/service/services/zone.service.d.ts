import { CreateZoneInput, DeletionResponse, MutationAddMembersToZoneArgs, MutationRemoveMembersFromZoneArgs, UpdateZoneInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Zone } from '../../entity/zone/zone.entity';
import { EventBus } from '../../event-bus';
/**
 * @description
 * Contains methods relating to {@link Zone} entities.
 *
 * @docsCategory services
 */
export declare class ZoneService {
    private connection;
    private configService;
    private eventBus;
    /**
     * We cache all Zones to avoid hitting the DB many times per request.
     */
    private zones;
    constructor(connection: TransactionalConnection, configService: ConfigService, eventBus: EventBus);
    /** @internal */
    initZones(): Promise<void>;
    findAll(ctx: RequestContext): Promise<Zone[]>;
    findOne(ctx: RequestContext, zoneId: ID): Promise<Zone | undefined>;
    create(ctx: RequestContext, input: CreateZoneInput): Promise<Zone>;
    update(ctx: RequestContext, input: UpdateZoneInput): Promise<Zone>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    addMembersToZone(ctx: RequestContext, { memberIds, zoneId }: MutationAddMembersToZoneArgs): Promise<Zone>;
    removeMembersFromZone(ctx: RequestContext, { memberIds, zoneId }: MutationRemoveMembersFromZoneArgs): Promise<Zone>;
    private getCountriesFromIds;
}
