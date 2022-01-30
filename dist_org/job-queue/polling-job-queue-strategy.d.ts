import { ID } from '@vendure/common/lib/shared-types';
import { InjectableJobQueueStrategy } from './injectable-job-queue-strategy';
import { Job } from './job';
import { JobData } from './types';
/**
 * @description
 * Defines the backoff strategy used when retrying failed jobs. Returns the delay in
 * ms that should pass before the failed job is retried.
 *
 * @docsCategory JobQueue
 * @docsPage types
 */
export declare type BackoffStrategy = (queueName: string, attemptsMade: number, job: Job) => number;
export interface PollingJobQueueStrategyConfig {
    /**
     * @description
     * How many jobs from a given queue to process concurrently.
     *
     * @default 1
     */
    concurrency?: number;
    /**
     * @description
     * The interval in ms between polling the database for new jobs.
     *
     * @description 200
     */
    pollInterval?: number | ((queueName: string) => number);
    /**
     * @description
     * The strategy used to decide how long to wait before retrying a failed job.
     *
     * @default () => 1000
     */
    backoffStrategy?: BackoffStrategy;
}
/**
 * @description
 * This class allows easier implementation of {@link JobQueueStrategy} in a polling style.
 * Instead of providing {@link JobQueueStrategy} `start()` you should provide a `next` method.
 *
 * This class should be extended by any strategy which does not support a push-based system
 * to notify on new jobs. It is used by the {@link SqlJobQueueStrategy} and {@link InMemoryJobQueueStrategy}.
 *
 * @docsCategory JobQueue
 */
export declare abstract class PollingJobQueueStrategy extends InjectableJobQueueStrategy {
    concurrency: number;
    pollInterval: number | ((queueName: string) => number);
    backOffStrategy?: BackoffStrategy;
    private activeQueues;
    constructor(config?: PollingJobQueueStrategyConfig);
    constructor(concurrency?: number, pollInterval?: number);
    start<Data extends JobData<Data> = {}>(queueName: string, process: (job: Job<Data>) => Promise<any>): Promise<void>;
    stop<Data extends JobData<Data> = {}>(queueName: string, process: (job: Job<Data>) => Promise<any>): Promise<void>;
    cancelJob(jobId: ID): Promise<Job | undefined>;
    /**
     * @description
     * Should return the next job in the given queue. The implementation is
     * responsible for returning the correct job according to the time of
     * creation.
     */
    abstract next(queueName: string): Promise<Job | undefined>;
    /**
     * @description
     * Update the job details in the store.
     */
    abstract update(job: Job): Promise<void>;
    /**
     * @description
     * Returns a job by its id.
     */
    abstract findOne(id: ID): Promise<Job | undefined>;
}
