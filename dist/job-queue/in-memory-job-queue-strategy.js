"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryJobQueueStrategy = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const vendure_logger_1 = require("../config/logger/vendure-logger");
const process_context_1 = require("../process-context/process-context");
const polling_job_queue_strategy_1 = require("./polling-job-queue-strategy");
/**
 * @description
 * An in-memory {@link JobQueueStrategy}. This is the default strategy if not using a dedicated
 * JobQueue plugin (e.g. {@link DefaultJobQueuePlugin}). Not recommended for production, since
 * the queue will be cleared when the server stops, and can only be used when the JobQueueService is
 * started from the main server process:
 *
 * @example
 * ```TypeScript
 * bootstrap(config)
 *   .then(app => app.get(JobQueueService).start());
 * ```
 *
 * Attempting to use this strategy when running the worker in a separate process (using `bootstrapWorker()`)
 * will result in an error on startup.
 *
 * Completed jobs will be evicted from the store every 2 hours to prevent a memory leak.
 *
 * @docsCategory JobQueue
 */
class InMemoryJobQueueStrategy extends polling_job_queue_strategy_1.PollingJobQueueStrategy {
    constructor() {
        super(...arguments);
        this.jobs = new Map();
        this.unsettledJobs = {};
        this.evictJobsAfterMs = 1000 * 60 * 60 * 2; // 2 hours
        this.processContextChecked = false;
        /**
         * Delete old jobs from the `jobs` Map if they are settled and older than the value
         * defined in `this.pruneJobsAfterMs`. This prevents a memory leak as the job queue
         * grows indefinitely.
         */
        this.evictSettledJobs = () => {
            const nowMs = +new Date();
            const olderThanMs = nowMs - this.evictJobsAfterMs;
            this.removeSettledJobs([], new Date(olderThanMs));
            this.timer = setTimeout(this.evictSettledJobs, this.evictJobsAfterMs);
        };
    }
    init(injector) {
        super.init(injector);
        this.processContext = injector.get(process_context_1.ProcessContext);
        this.timer = setTimeout(this.evictSettledJobs, this.evictJobsAfterMs);
    }
    destroy() {
        super.destroy();
        clearTimeout(this.timer);
    }
    async add(job) {
        if (!job.id) {
            job.id = Math.floor(Math.random() * 1000000000)
                .toString()
                .padEnd(10, '0');
        }
        job.retries = this.setRetries(job.queueName, job);
        // tslint:disable-next-line:no-non-null-assertion
        this.jobs.set(job.id, job);
        if (!this.unsettledJobs[job.queueName]) {
            this.unsettledJobs[job.queueName] = [];
        }
        this.unsettledJobs[job.queueName].push({ job, updatedAt: new Date() });
        return job;
    }
    async findOne(id) {
        return this.jobs.get(id);
    }
    async findMany(options) {
        let items = [...this.jobs.values()];
        if (options) {
            if (options.sort) {
                items = this.applySort(items, options.sort);
            }
            if (options.filter) {
                items = this.applyFilters(items, options.filter);
            }
            if (options.skip || options.take) {
                items = this.applyPagination(items, options.skip, options.take);
            }
        }
        return {
            items,
            totalItems: items.length,
        };
    }
    async findManyById(ids) {
        return ids.map(id => this.jobs.get(id)).filter(shared_utils_1.notNullOrUndefined);
    }
    async next(queueName, waitingJobs = []) {
        var _a, _b, _c;
        this.checkProcessContext();
        const nextIndex = (_a = this.unsettledJobs[queueName]) === null || _a === void 0 ? void 0 : _a.findIndex(item => !waitingJobs.includes(item.job));
        if (nextIndex === -1) {
            return;
        }
        const next = (_b = this.unsettledJobs[queueName]) === null || _b === void 0 ? void 0 : _b.splice(nextIndex, 1)[0];
        if (next) {
            if (next.job.state === generated_types_1.JobState.RETRYING && typeof this.backOffStrategy === 'function') {
                const msSinceLastFailure = Date.now() - +next.updatedAt;
                const backOffDelayMs = this.backOffStrategy(queueName, next.job.attempts, next.job);
                if (msSinceLastFailure < backOffDelayMs) {
                    (_c = this.unsettledJobs[queueName]) === null || _c === void 0 ? void 0 : _c.push(next);
                    return;
                }
            }
            next.job.start();
            return next.job;
        }
    }
    async update(job) {
        if (job.state === generated_types_1.JobState.RETRYING || job.state === generated_types_1.JobState.PENDING) {
            this.unsettledJobs[job.queueName].unshift({ job, updatedAt: new Date() });
        }
        // tslint:disable-next-line:no-non-null-assertion
        this.jobs.set(job.id, job);
    }
    async removeSettledJobs(queueNames = [], olderThan) {
        let removed = 0;
        for (const job of this.jobs.values()) {
            if (0 < queueNames.length && !queueNames.includes(job.queueName)) {
                continue;
            }
            if (job.isSettled) {
                if (olderThan) {
                    if (job.settledAt && job.settledAt < olderThan) {
                        // tslint:disable-next-line:no-non-null-assertion
                        this.jobs.delete(job.id);
                        removed++;
                    }
                }
                else {
                    // tslint:disable-next-line:no-non-null-assertion
                    this.jobs.delete(job.id);
                    removed++;
                }
            }
        }
        return removed;
    }
    applySort(items, sort) {
        for (const [prop, direction] of Object.entries(sort)) {
            const key = prop;
            const dir = direction === 'ASC' ? -1 : 1;
            items = items.sort((a, b) => ((a[key] || 0) < (b[key] || 0) ? 1 * dir : -1 * dir));
        }
        return items;
    }
    applyFilters(items, filters) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        for (const [prop, operator] of Object.entries(filters)) {
            const key = prop;
            if ((operator === null || operator === void 0 ? void 0 : operator.eq) !== undefined) {
                items = items.filter(i => i[key] === operator.eq);
            }
            const contains = (_a = operator) === null || _a === void 0 ? void 0 : _a.contains;
            if (contains) {
                items = items.filter(i => i[key].includes(contains));
            }
            const gt = (_b = operator) === null || _b === void 0 ? void 0 : _b.gt;
            if (gt) {
                items = items.filter(i => i[key] > gt);
            }
            const gte = (_c = operator) === null || _c === void 0 ? void 0 : _c.gte;
            if (gte) {
                items = items.filter(i => i[key] >= gte);
            }
            const lt = (_d = operator) === null || _d === void 0 ? void 0 : _d.lt;
            if (lt) {
                items = items.filter(i => i[key] < lt);
            }
            const lte = (_e = operator) === null || _e === void 0 ? void 0 : _e.lte;
            if (lte) {
                items = items.filter(i => i[key] <= lte);
            }
            const before = (_f = operator) === null || _f === void 0 ? void 0 : _f.before;
            if (before) {
                items = items.filter(i => i[key] <= before);
            }
            const after = (_g = operator) === null || _g === void 0 ? void 0 : _g.after;
            if (after) {
                items = items.filter(i => i[key] >= after);
            }
            const between = (_h = operator) === null || _h === void 0 ? void 0 : _h.between;
            if (between) {
                items = items.filter(i => {
                    const num = i[key];
                    return num > between.start && num < between.end;
                });
            }
        }
        return items;
    }
    applyPagination(items, skip, take) {
        const start = skip || 0;
        const end = take != null ? start + take : undefined;
        return items.slice(start, end);
    }
    checkProcessContext() {
        if (!this.processContextChecked) {
            if (this.processContext.isWorker) {
                vendure_logger_1.Logger.error(`The InMemoryJobQueueStrategy will not work when running job queues outside the main server process!`);
                process.kill(process.pid, 'SIGINT');
            }
            this.processContextChecked = true;
        }
    }
}
exports.InMemoryJobQueueStrategy = InMemoryJobQueueStrategy;
//# sourceMappingURL=in-memory-job-queue-strategy.js.map