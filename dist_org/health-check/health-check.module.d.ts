import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { HealthCheckRegistryService } from './health-check-registry.service';
import { WorkerHealthIndicator } from './worker-health-indicator';
export declare class HealthCheckModule {
    private configService;
    private healthCheckRegistryService;
    private typeOrm;
    private worker;
    constructor(configService: ConfigService, healthCheckRegistryService: HealthCheckRegistryService, typeOrm: TypeOrmHealthIndicator, worker: WorkerHealthIndicator);
}
