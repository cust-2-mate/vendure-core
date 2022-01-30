import { DeepPartial } from '@vendure/common/lib/shared-types';
import { AuthenticationMethod } from './authentication-method.entity';
export declare class ExternalAuthenticationMethod extends AuthenticationMethod {
    constructor(input: DeepPartial<ExternalAuthenticationMethod>);
    strategy: string;
    externalIdentifier: string;
    metadata: any;
}
