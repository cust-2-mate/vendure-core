import { HistoryEntryType } from '@vendure/common/lib/generated-types';
import { Administrator } from '../administrator/administrator.entity';
import { VendureEntity } from '../base/base.entity';
export declare abstract class HistoryEntry extends VendureEntity {
    administrator?: Administrator;
    readonly type: HistoryEntryType;
    isPublic: boolean;
    data: any;
}
