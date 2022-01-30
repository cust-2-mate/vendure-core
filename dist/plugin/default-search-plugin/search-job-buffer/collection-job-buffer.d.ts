import { Job, JobBuffer } from '../../../job-queue/index';
import { ApplyCollectionFiltersJobData } from '../../../service/services/collection.service';
export declare class CollectionJobBuffer implements JobBuffer<ApplyCollectionFiltersJobData> {
    readonly id = "search-plugin-apply-collection-filters";
    collect(job: Job): boolean;
    reduce(collectedJobs: Array<Job<ApplyCollectionFiltersJobData>>): Array<Job<any>>;
}
