import { DeepPartial } from '@vendure/common/lib/shared-types';
import { SoftDeletable } from '../../common/types/common-types';
import { HasCustomFields } from '../../config/custom-field/custom-field-types';
import { VendureEntity } from '../base/base.entity';
import { CustomAdministratorFields } from '../custom-entity-fields';
import { User } from '../user/user.entity';
/**
 * @description
 * An administrative user who has access to the admin ui.
 *
 * @docsCategory entities
 */
export declare class Administrator extends VendureEntity implements SoftDeletable, HasCustomFields {
    constructor(input?: DeepPartial<Administrator>);
    deletedAt: Date | null;
    firstName: string;
    lastName: string;
    emailAddress: string;
    user: User;
    customFields: CustomAdministratorFields;
}
