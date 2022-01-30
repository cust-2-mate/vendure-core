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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_helpers_1 = require("./config-helpers");
const vendure_logger_1 = require("./logger/vendure-logger");
let ConfigService = class ConfigService {
    constructor() {
        this.activeConfig = config_helpers_1.getConfig();
        if (this.activeConfig.authOptions.disableAuth) {
            // tslint:disable-next-line
            vendure_logger_1.Logger.warn('Auth has been disabled. This should never be the case for a production system!');
        }
    }
    get apiOptions() {
        return this.activeConfig.apiOptions;
    }
    get authOptions() {
        return this.activeConfig.authOptions;
    }
    get catalogOptions() {
        return this.activeConfig.catalogOptions;
    }
    get defaultChannelToken() {
        return this.activeConfig.defaultChannelToken;
    }
    get defaultLanguageCode() {
        return this.activeConfig.defaultLanguageCode;
    }
    get entityIdStrategy() {
        return this.activeConfig.entityIdStrategy;
    }
    get assetOptions() {
        return this.activeConfig.assetOptions;
    }
    get dbConnectionOptions() {
        return this.activeConfig.dbConnectionOptions;
    }
    get promotionOptions() {
        return this.activeConfig.promotionOptions;
    }
    get shippingOptions() {
        return this.activeConfig.shippingOptions;
    }
    get orderOptions() {
        return this.activeConfig.orderOptions;
    }
    get paymentOptions() {
        return this.activeConfig.paymentOptions;
    }
    get taxOptions() {
        return this.activeConfig.taxOptions;
    }
    get importExportOptions() {
        return this.activeConfig.importExportOptions;
    }
    get customFields() {
        return this.activeConfig.customFields;
    }
    get plugins() {
        return this.activeConfig.plugins;
    }
    get logger() {
        return this.activeConfig.logger;
    }
    get jobQueueOptions() {
        return this.activeConfig.jobQueueOptions;
    }
};
ConfigService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], ConfigService);
exports.ConfigService = ConfigService;
//# sourceMappingURL=config.service.js.map