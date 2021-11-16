import { CreateZoneInput, DeletionResponse, MutationAddMembersToZoneArgs, MutationRemoveMembersFromZoneArgs, UpdateZoneInput } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { RequestContext } from '../../api/common/request-context';
import { Zone } from '../../entity/zone/zone.entity';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class ZoneService {
    private connection;
    /**
     * We cache all Zones to avoid hitting the DB many times per request.
     */
    private zones;
    constructor(connection: TransactionalConnection);
    initZones(): Promise<void>;
    findAll(ctx: RequestContext): Zone[];
    findOne(ctx: RequestContext, zoneId: ID): Promise<Zone | undefined>;
    create(ctx: RequestContext, input: CreateZoneInput): Promise<Zone>;
    update(ctx: RequestContext, input: UpdateZoneInput): Promise<Zone>;
    delete(ctx: RequestContext, id: ID): Promise<DeletionResponse>;
    addMembersToZone(ctx: RequestContext, input: MutationAddMembersToZoneArgs): Promise<Zone>;
    removeMembersFromZone(ctx: RequestContext, input: MutationRemoveMembersFromZoneArgs): Promise<Zone>;
    private getCountriesFromIds;
    /**
     * TODO: This is not good for multi-instance deployments. A better solution will
     * need to be found without adversely affecting performance.
     */
    updateZonesCache(ctx?: RequestContext): Promise<void>;
}
