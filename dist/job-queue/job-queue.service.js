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
exports.JobQueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("../config");
const constants_1 = require("./constants");
const job_queue_1 = require("./job-queue");
/**
 * @description
 * The JobQueueService is used to create new {@link JobQueue} instances and access
 * existing jobs.
 *
 * @example
 * ```TypeScript
 * // A service which transcodes video files
 * class VideoTranscoderService {
 *
 *   private jobQueue: JobQueue<{ videoId: string; }>;
 *
 *   async onModuleInit() {
 *     // The JobQueue is created on initialization
 *     this.jobQueue = await this.jobQueueService.createQueue({
 *       name: 'transcode-video',
 *       process: async job => {
 *         return await this.transcodeVideo(job.data.videoId);
 *       },
 *     });
 *   }
 *
 *   addToTranscodeQueue(videoId: string) {
 *     this.jobQueue.add({ videoId, })
 *   }
 *
 *   private async transcodeVideo(videoId: string) {
 *     // e.g. call some external transcoding service
 *   }
 *
 * }
 * ```
 *
 * @docsCategory JobQueue
 */
let JobQueueService = class JobQueueService {
    constructor(configService) {
        this.configService = configService;
        this.queues = [];
        this.hasStarted = false;
    }
    get jobQueueStrategy() {
        return this.configService.jobQueueOptions.jobQueueStrategy;
    }
    /** @internal */
    onModuleDestroy() {
        this.hasStarted = false;
        return Promise.all(this.queues.map(q => q.stop()));
    }
    /**
     * @description
     * Configures and creates a new {@link JobQueue} instance.
     */
    async createQueue(options) {
        const queue = new job_queue_1.JobQueue(options, this.jobQueueStrategy);
        if (this.hasStarted && this.shouldStartQueue(queue.name)) {
            await queue.start();
        }
        this.queues.push(queue);
        return queue;
    }
    async start() {
        this.hasStarted = true;
        for (const queue of this.queues) {
            if (!queue.started && this.shouldStartQueue(queue.name)) {
                config_1.Logger.info(`Starting queue: ${queue.name}`, constants_1.loggerCtx);
                await queue.start();
            }
        }
    }
    /**
     * @description
     * Returns an array of `{ name: string; running: boolean; }` for each
     * registered JobQueue.
     */
    getJobQueues() {
        return this.queues.map(queue => ({
            name: queue.name,
            running: queue.started,
        }));
    }
    shouldStartQueue(queueName) {
        if (this.configService.jobQueueOptions.activeQueues.length > 0) {
            if (!this.configService.jobQueueOptions.activeQueues.includes(queueName)) {
                return false;
            }
        }
        return true;
    }
};
JobQueueService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JobQueueService);
exports.JobQueueService = JobQueueService;
//# sourceMappingURL=job-queue.service.js.map