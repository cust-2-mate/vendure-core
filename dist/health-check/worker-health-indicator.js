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
exports.WorkerHealthIndicator = exports.WORKER_HEALTH_QUEUE_NAME = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_service_1 = require("../config/config.service");
const inspectable_job_queue_strategy_1 = require("../config/job-queue/inspectable-job-queue-strategy");
const vendure_logger_1 = require("../config/logger/vendure-logger");
const job_queue_service_1 = require("../job-queue/job-queue.service");
exports.WORKER_HEALTH_QUEUE_NAME = 'check-worker-health';
let WorkerHealthIndicator = class WorkerHealthIndicator extends terminus_1.HealthIndicator {
    constructor(jobQueueService, configService) {
        super();
        this.jobQueueService = jobQueueService;
        this.configService = configService;
    }
    async onModuleInit() {
        const { jobQueueStrategy, enableWorkerHealthCheck } = this.configService.jobQueueOptions;
        if (enableWorkerHealthCheck && inspectable_job_queue_strategy_1.isInspectableJobQueueStrategy(jobQueueStrategy)) {
            this.queue = await this.jobQueueService.createQueue({
                name: exports.WORKER_HEALTH_QUEUE_NAME,
                process: async (job) => {
                    return { workerPid: process.pid };
                },
            });
        }
    }
    /**
     * This health check works by adding a job to the queue and checking whether it got picked up
     * by a worker.
     */
    async isHealthy() {
        if (this.queue) {
            const job = await this.queue.add({});
            let isHealthy;
            try {
                isHealthy = !!(await job.updates({ timeoutMs: 10000 }).toPromise());
            }
            catch (e) {
                vendure_logger_1.Logger.error(e.message);
                isHealthy = false;
            }
            const result = this.getStatus('worker', isHealthy);
            if (isHealthy) {
                return result;
            }
            throw new terminus_1.HealthCheckError('Worker health check failed', result);
        }
        else {
            throw new terminus_1.HealthCheckError('Current JobQueueStrategy does not support internal health checks', this.getStatus('worker', false));
        }
    }
};
WorkerHealthIndicator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [job_queue_service_1.JobQueueService, config_service_1.ConfigService])
], WorkerHealthIndicator);
exports.WorkerHealthIndicator = WorkerHealthIndicator;
//# sourceMappingURL=worker-health-indicator.js.map