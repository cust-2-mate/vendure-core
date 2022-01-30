import { OnModuleInit } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';
import { JobQueueService } from '../job-queue/job-queue.service';
export declare const WORKER_HEALTH_QUEUE_NAME = "check-worker-health";
export declare class WorkerHealthIndicator extends HealthIndicator implements OnModuleInit {
    private jobQueueService;
    private configService;
    private queue;
    constructor(jobQueueService: JobQueueService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    /**
     * This health check works by adding a job to the queue and checking whether it got picked up
     * by a worker.
     */
    isHealthy(): Promise<HealthIndicatorResult>;
}
