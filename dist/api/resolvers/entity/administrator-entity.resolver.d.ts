import { Administrator } from '../../../entity/administrator/administrator.entity';
import { User } from '../../../entity/user/user.entity';
import { UserService } from '../../../service/services/user.service';
import { RequestContext } from '../../common/request-context';
export declare class AdministratorEntityResolver {
    private userService;
    constructor(userService: UserService);
    user(ctx: RequestContext, administrator: Administrator): Promise<User>;
}
