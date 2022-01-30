import { VendureEntity } from '../base/base.entity';
import { User } from '../user/user.entity';
export declare abstract class AuthenticationMethod extends VendureEntity {
    user: User;
}
