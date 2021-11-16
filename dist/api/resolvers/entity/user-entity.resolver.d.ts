import { AuthenticationMethod as AuthenticationMethodType } from '@vendure/common/lib/generated-types';
import { User } from '../../../entity/user/user.entity';
import { UserService } from '../../../service/services/user.service';
import { RequestContext } from '../../common/request-context';
export declare class UserEntityResolver {
    private userService;
    constructor(userService: UserService);
    authenticationMethods(ctx: RequestContext, user: User): Promise<AuthenticationMethodType[]>;
}
