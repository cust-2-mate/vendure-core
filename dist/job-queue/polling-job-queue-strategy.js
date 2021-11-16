"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollingJobQueueStrategy = void 0;
const generated_types_1 = require("@vendure/common/lib/generated-types");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const rxjs_1 = require("rxjs");
const internal_compatibility_1 = require("rxjs/internal-compatibility");
const operators_1 = require("rxjs/operators");
const vendure_logger_1 = require("../config/logger/vendure-logger");
const injectable_job_queue_strategy_1 = require("./injectable-job-queue-strategy");
const job_1 = require("./job");
const queue_name_process_storage_1 = require("./queue-name-process-storage");
const STOP_SIGNAL = Symbol('STOP_SIGNAL');
class ActiveQueue {
    constructor(queueName, process, jobQueueStrategy) {
        this.queueName = queueName;
        this.process = process;
        this.jobQueueStrategy = jobQueueStrategy;
        this.running = false;
        this.activeJobs = [];
        this.errorNotifier$ = new rxjs_1.Subject();
        this.queueStopped$ = new rxjs_1.Subject();
        this.subscription = this.errorNotifier$.pipe(operators_1.throttleTime(3000)).subscribe(([message, stack]) => {
            vendure_logger_1.Logger.error(message);
            vendure_logger_1.Logger.debug(stack);
        });
        this.pollInterval =
            typeof this.jobQueueStrategy.pollInterval === 'function'
                ? this.jobQueueStrategy.pollInterval(queueName)
                : this.jobQueueStrategy.pollInterval;
    }
    start() {
        vendure_logger_1.Logger.debug(`Starting JobQueue "${this.queueName}"`);
        this.running = true;
        const runNextJobs = async () => {
            try {
                const runningJobsCount = this.activeJobs.length;
                for (let i = runningJobsCount; i < this.jobQueueStrategy.concurrency; i++) {
                    const nextJob = await this.jobQueueStrategy.next(this.queueName);
                    if (nextJob) {
                        this.activeJobs.push(nextJob);
                        await this.jobQueueStrategy.update(nextJob);
                        const onProgress = (job) => this.jobQueueStrategy.update(job);
                        nextJob.on('progress', onProgress);
                        const cancellationSignal$ = rxjs_1.interval(this.pollInterval * 5).pipe(
                        // tslint:disable-next-line:no-non-null-assertion
                        operators_1.switchMap(() => this.jobQueueStrategy.findOne(nextJob.id)), operators_1.filter(job => (job === null || job === void 0 ? void 0 : job.state) === generated_types_1.JobState.CANCELLED), operators_1.take(1));
                        const stopSignal$ = this.queueStopped$.pipe(operators_1.take(1));
                        rxjs_1.race(internal_compatibility_1.fromPromise(this.process(nextJob)), cancellationSignal$, stopSignal$)
                            .toPromise()
                            .then(result => {
                            if (result === STOP_SIGNAL) {
                                nextJob.defer();
                            }
                            else if (result instanceof job_1.Job && result.state === generated_types_1.JobState.CANCELLED) {
                                nextJob.cancel();
                            }
                            else {
                                nextJob.complete(result);
                            }
                        }, err => {
                            nextJob.fail(err);
                        })
                            .finally(() => {
                            if (!this.running && nextJob.state !== generated_types_1.JobState.PENDING) {
                                return;
                            }
                            nextJob.off('progress', onProgress);
                            return this.onFailOrComplete(nextJob);
                        })
                            .catch(err => {
                            vendure_logger_1.Logger.warn(`Error updating job info: ${err}`);
                        });
                    }
                }
            }
            catch (e) {
                this.errorNotifier$.next([
                    `Job queue "${this.queueName}" encountered an error (set log level to Debug for trace): ${e.message}`,
                    e.stack,
                ]);
            }
            if (this.running) {
                this.timer = setTimeout(runNextJobs, this.pollInterval);
            }
        };
        runNextJobs();
    }
    stop() {
        this.running = false;
        this.queueStopped$.next(STOP_SIGNAL);
        clearTimeout(this.timer);
        const start = +new Date();
        // Wait for 2 seconds to allow running jobs to complete
        const maxTimeout = 2000;
        let pollTimer;
        return new Promise(resolve => {
            const pollActiveJobs = async () => {
                const timedOut = +new Date() - start > maxTimeout;
                if (this.activeJobs.length === 0 || timedOut) {
                    clearTimeout(pollTimer);
                    resolve();
                }
                else {
                    pollTimer = setTimeout(pollActiveJobs, 50);
                }
            };
            pollActiveJobs();
        });
    }
    async onFailOrComplete(job) {
        await this.jobQueueStrategy.update(job);
        this.removeJobFromActive(job);
    }
    removeJobFromActive(job) {
        const index = this.activeJobs.indexOf(job);
        this.activeJobs.splice(index, 1);
    }
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
class PollingJobQueueStrategy extends injectable_job_queue_strategy_1.InjectableJobQueueStrategy {
    constructor(concurrencyOrConfig, maybePollInterval) {
        var _a, _b, _c;
        super();
        this.activeQueues = new queue_name_process_storage_1.QueueNameProcessStorage();
        if (concurrencyOrConfig && shared_utils_1.isObject(concurrencyOrConfig)) {
            this.concurrency = (_a = concurrencyOrConfig.concurrency) !== null && _a !== void 0 ? _a : 1;
            this.pollInterval = (_b = concurrencyOrConfig.pollInterval) !== null && _b !== void 0 ? _b : 200;
            this.backOffStrategy = (_c = concurrencyOrConfig.backoffStrategy) !== null && _c !== void 0 ? _c : (() => 1000);
        }
        else {
            this.concurrency = concurrencyOrConfig !== null && concurrencyOrConfig !== void 0 ? concurrencyOrConfig : 1;
            this.pollInterval = maybePollInterval !== null && maybePollInterval !== void 0 ? maybePollInterval : 200;
        }
    }
    async start(queueName, process) {
        if (!this.hasInitialized) {
            this.started.set(queueName, process);
            return;
        }
        if (this.activeQueues.has(queueName, process)) {
            return;
        }
        const active = new ActiveQueue(queueName, process, this);
        active.start();
        this.activeQueues.set(queueName, process, active);
    }
    async stop(queueName, process) {
        const active = this.activeQueues.getAndDelete(queueName, process);
        if (!active) {
            return;
        }
        await active.stop();
    }
    async cancelJob(jobId) {
        const job = await this.findOne(jobId);
        if (job) {
            job.cancel();
            await this.update(job);
            return job;
        }
    }
}
exports.PollingJobQueueStrategy = PollingJobQueueStrategy;
//# sourceMappingURL=polling-job-queue-strategy.js.map