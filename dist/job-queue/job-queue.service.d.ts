import { OnModuleDestroy } from '@nestjs/common';
import { JobQueue as GraphQlJobQueue } from '@vendure/common/lib/generated-types';
import { ConfigService } from '../config';
import { JobQueue } from './job-queue';
import { CreateQueueOptions, JobData } from './types';
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
export declare class JobQueueService implements OnModuleDestroy {
    private configService;
    private queues;
    private hasStarted;
    private get jobQueueStrategy();
    constructor(configService: ConfigService);
    /** @internal */
    onModuleDestroy(): Promise<void[]>;
    /**
     * @description
     * Configures and creates a new {@link JobQueue} instance.
     */
    createQueue<Data extends JobData<Data>>(options: CreateQueueOptions<Data>): Promise<JobQueue<Data>>;
    start(): Promise<void>;
    /**
     * @description
     * Returns an array of `{ name: string; running: boolean; }` for each
     * registered JobQueue.
     */
    getJobQueues(): GraphQlJobQueue[];
    private shouldStartQueue;
}
