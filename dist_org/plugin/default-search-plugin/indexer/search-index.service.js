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
exports.SearchIndexService = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const vendure_logger_1 = require("../../../config/logger/vendure-logger");
const job_queue_service_1 = require("../../../job-queue/job-queue.service");
const indexer_controller_1 = require("./indexer.controller");
/**
 * This service is responsible for messaging the {@link IndexerController} with search index updates.
 */
let SearchIndexService = class SearchIndexService {
    constructor(jobService, indexerController) {
        this.jobService = jobService;
        this.indexerController = indexerController;
    }
    async onApplicationBootstrap() {
        this.updateIndexQueue = await this.jobService.createQueue({
            name: 'update-search-index',
            process: job => {
                const data = job.data;
                switch (data.type) {
                    case 'reindex':
                        vendure_logger_1.Logger.verbose(`sending ReindexMessage`);
                        return this.jobWithProgress(job, this.indexerController.reindex(data));
                    case 'update-product':
                        return this.indexerController.updateProduct(data);
                    case 'update-variants':
                        return this.indexerController.updateVariants(data);
                    case 'delete-product':
                        return this.indexerController.deleteProduct(data);
                    case 'delete-variant':
                        return this.indexerController.deleteVariant(data);
                    case 'update-variants-by-id':
                        return this.jobWithProgress(job, this.indexerController.updateVariantsById(data));
                    case 'update-asset':
                        return this.indexerController.updateAsset(data);
                    case 'delete-asset':
                        return this.indexerController.deleteAsset(data);
                    case 'assign-product-to-channel':
                        return this.indexerController.assignProductToChannel(data);
                    case 'remove-product-from-channel':
                        return this.indexerController.removeProductFromChannel(data);
                    case 'assign-variant-to-channel':
                        return this.indexerController.assignVariantToChannel(data);
                    case 'remove-variant-from-channel':
                        return this.indexerController.removeVariantFromChannel(data);
                    default:
                        shared_utils_1.assertNever(data);
                        return Promise.resolve();
                }
            },
        });
    }
    reindex(ctx) {
        return this.updateIndexQueue.add({ type: 'reindex', ctx: ctx.serialize() });
    }
    updateProduct(ctx, product) {
        this.updateIndexQueue.add({ type: 'update-product', ctx: ctx.serialize(), productId: product.id });
    }
    updateVariants(ctx, variants) {
        const variantIds = variants.map(v => v.id);
        this.updateIndexQueue.add({ type: 'update-variants', ctx: ctx.serialize(), variantIds });
    }
    deleteProduct(ctx, product) {
        this.updateIndexQueue.add({ type: 'delete-product', ctx: ctx.serialize(), productId: product.id });
    }
    deleteVariant(ctx, variants) {
        const variantIds = variants.map(v => v.id);
        this.updateIndexQueue.add({ type: 'delete-variant', ctx: ctx.serialize(), variantIds });
    }
    updateVariantsById(ctx, ids) {
        this.updateIndexQueue.add({ type: 'update-variants-by-id', ctx: ctx.serialize(), ids });
    }
    updateAsset(ctx, asset) {
        this.updateIndexQueue.add({ type: 'update-asset', ctx: ctx.serialize(), asset: asset });
    }
    deleteAsset(ctx, asset) {
        this.updateIndexQueue.add({ type: 'delete-asset', ctx: ctx.serialize(), asset: asset });
    }
    assignProductToChannel(ctx, productId, channelId) {
        this.updateIndexQueue.add({
            type: 'assign-product-to-channel',
            ctx: ctx.serialize(),
            productId,
            channelId,
        });
    }
    removeProductFromChannel(ctx, productId, channelId) {
        this.updateIndexQueue.add({
            type: 'remove-product-from-channel',
            ctx: ctx.serialize(),
            productId,
            channelId,
        });
    }
    assignVariantToChannel(ctx, productVariantId, channelId) {
        this.updateIndexQueue.add({
            type: 'assign-variant-to-channel',
            ctx: ctx.serialize(),
            productVariantId,
            channelId,
        });
    }
    removeVariantFromChannel(ctx, productVariantId, channelId) {
        this.updateIndexQueue.add({
            type: 'remove-variant-from-channel',
            ctx: ctx.serialize(),
            productVariantId,
            channelId,
        });
    }
    jobWithProgress(job, ob) {
        return new Promise((resolve, reject) => {
            let total;
            let duration = 0;
            let completed = 0;
            ob.subscribe({
                next: (response) => {
                    if (!total) {
                        total = response.total;
                    }
                    duration = response.duration;
                    completed = response.completed;
                    const progress = total === 0 ? 100 : Math.ceil((completed / total) * 100);
                    job.setProgress(progress);
                },
                complete: () => {
                    resolve({
                        success: true,
                        indexedItemCount: total,
                        timeTaken: duration,
                    });
                },
                error: (err) => {
                    vendure_logger_1.Logger.error(JSON.stringify(err));
                    reject(err);
                },
            });
        });
    }
};
SearchIndexService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [job_queue_service_1.JobQueueService, indexer_controller_1.IndexerController])
], SearchIndexService);
exports.SearchIndexService = SearchIndexService;
//# sourceMappingURL=search-index.service.js.map