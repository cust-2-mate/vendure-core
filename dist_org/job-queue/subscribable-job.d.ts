import { Observable } from 'rxjs';
import { JobQueueStrategy } from '../config/job-queue/job-queue-strategy';
import { Job } from './job';
import { JobData } from './types';
/**
 * @description
 * Job update status as returned from the {@link SubscribableJob}'s `update()` method.
 *
 * @docsCategory JobQueue
 * @docsPage types
 */
export declare type JobUpdate<T extends JobData<T>> = Pick<Job<T>, 'id' | 'state' | 'progress' | 'result' | 'error' | 'data'>;
/**
 * @description
 * This is a type of Job object that allows you to subscribe to updates to the Job. It is returned
 * by the {@link JobQueue}'s `add()` method. Note that the subscription capability is only supported
 * if the {@link JobQueueStrategy} implements the {@link InspectableJobQueueStrategy} interface (e.g.
 * the {@link SqlJobQueueStrategy} does support this).
 *
 * @docsCategory JobQueue
 */
export declare class SubscribableJob<T extends JobData<T> = any> extends Job<T> {
    private readonly jobQueueStrategy;
    constructor(job: Job<T>, jobQueueStrategy: JobQueueStrategy);
    /**
     * @description
     * Returns an Observable stream of updates to the Job. Works by polling the current JobQueueStrategy's `findOne()` method
     * to obtain updates. If this updates are not subscribed to, then no polling occurs.
     *
     * The polling interval defaults to 200ms, but can be configured by passing in an options argument. Polling will also timeout
     * after 1 hour, but this timeout can also be configured by passing the `timeoutMs` option.
     */
    updates(options?: {
        pollInterval?: number;
        timeoutMs?: number;
    }): Observable<JobUpdate<T>>;
}
