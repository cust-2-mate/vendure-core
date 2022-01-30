import { UpdateGlobalSettingsInput } from '@vendure/common/lib/generated-types';
import { RequestContext } from '../../api/common/request-context';
import { ConfigService } from '../../config/config.service';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { GlobalSettings } from '../../entity/global-settings/global-settings.entity';
import { EventBus } from '../../event-bus';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
/**
 * @description
 * Contains methods relating to the {@link GlobalSettings} entity.
 *
 * @docsCategory services
 */
export declare class GlobalSettingsService {
    private connection;
    private configService;
    private customFieldRelationService;
    private eventBus;
    constructor(connection: TransactionalConnection, configService: ConfigService, customFieldRelationService: CustomFieldRelationService, eventBus: EventBus);
    /**
     * Ensure there is a single global settings row in the database.
     * @internal
     */
    initGlobalSettings(): Promise<void>;
    /**
     * @description
     * Returns the GlobalSettings entity.
     */
    getSettings(ctx: RequestContext): Promise<GlobalSettings>;
    updateSettings(ctx: RequestContext, input: UpdateGlobalSettingsInput): Promise<GlobalSettings>;
}
