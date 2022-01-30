import { Job } from '../../../job-queue/job';
export declare class JobEntityResolver {
    private readonly graphQlMaxInt;
    duration(job: Job): Promise<number>;
}
