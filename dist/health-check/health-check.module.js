"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckModule = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_module_1 = require("../config/config.module");
const config_service_1 = require("../config/config.service");
const inspectable_job_queue_strategy_1 = require("../config/job-queue/inspectable-job-queue-strategy");
const job_queue_module_1 = require("../job-queue/job-queue.module");
const health_check_registry_service_1 = require("./health-check-registry.service");
const health_check_controller_1 = require("./health-check.controller");
const worker_health_indicator_1 = require("./worker-health-indicator");
let HealthCheckModule = class HealthCheckModule {
    constructor(configService, healthCheckRegistryService, typeOrm, worker) {
        this.configService = configService;
        this.healthCheckRegistryService = healthCheckRegistryService;
        this.typeOrm = typeOrm;
        this.worker = worker;
        // Register the default health checks for database and worker
        this.healthCheckRegistryService.registerIndicatorFunction([() => this.typeOrm.pingCheck('database')]);
        const { enableWorkerHealthCheck, jobQueueStrategy } = this.configService.jobQueueOptions;
        if (enableWorkerHealthCheck && inspectable_job_queue_strategy_1.isInspectableJobQueueStrategy(jobQueueStrategy)) {
            this.healthCheckRegistryService.registerIndicatorFunction([() => this.worker.isHealthy()]);
        }
    }
};
HealthCheckModule = __decorate([
    common_1.Module({
        imports: [terminus_1.TerminusModule, config_module_1.ConfigModule, job_queue_module_1.JobQueueModule],
        controllers: [health_check_controller_1.HealthController],
        providers: [health_check_registry_service_1.HealthCheckRegistryService, worker_health_indicator_1.WorkerHealthIndicator],
        exports: [health_check_registry_service_1.HealthCheckRegistryService],
    }),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        health_check_registry_service_1.HealthCheckRegistryService,
        terminus_1.TypeOrmHealthIndicator,
        worker_health_indicator_1.WorkerHealthIndicator])
], HealthCheckModule);
exports.HealthCheckModule = HealthCheckModule;
//# sourceMappingURL=health-check.module.js.map