import { UpdateGlobalSettingsInput } from '@vendure/common/lib/generated-types';
import { RequestContext } from '../../api/common/request-context';
import { ConfigService } from '../../config/config.service';
import { GlobalSettings } from '../../entity/global-settings/global-settings.entity';
import { CustomFieldRelationService } from '../helpers/custom-field-relation/custom-field-relation.service';
import { TransactionalConnection } from '../transaction/transactional-connection';
export declare class GlobalSettingsService {
    private connection;
    private configService;
    private customFieldRelationService;
    constructor(connection: TransactionalConnection, configService: ConfigService, customFieldRelationService: CustomFieldRelationService);
    /**
     * Ensure there is a single global settings row in the database.
     */
    initGlobalSettings(): Promise<void>;
    getSettings(ctx: RequestContext): Promise<GlobalSettings>;
    updateSettings(ctx: RequestContext, input: UpdateGlobalSettingsInput): Promise<GlobalSettings>;
}
