import { JobQueue, MutationCancelJobArgs, MutationRemoveSettledJobsArgs, QueryJobArgs, QueryJobsArgs, QueryJobsByIdArgs } from '@vendure/common/lib/generated-types';
import { ConfigService } from '../../../config';
import { JobQueueService } from '../../../job-queue';
export declare class JobResolver {
    private configService;
    private jobService;
    constructor(configService: ConfigService, jobService: JobQueueService);
    job(args: QueryJobArgs): Promise<import("../../../job-queue").Job<any> | undefined>;
    jobs(args: QueryJobsArgs): Promise<import("@vendure/common/lib/shared-types").PaginatedList<import("../../../job-queue").Job<any>>>;
    jobsById(args: QueryJobsByIdArgs): Promise<import("../../../job-queue").Job<any>[]>;
    jobQueues(): JobQueue[];
    removeSettledJobs(args: MutationRemoveSettledJobsArgs): Promise<number>;
    cancelJob(args: MutationCancelJobArgs): Promise<import("../../../job-queue").Job<any> | undefined>;
    private requireInspectableJobQueueStrategy;
}
