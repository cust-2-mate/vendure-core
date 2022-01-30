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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRateResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const tax_rate_service_1 = require("../../../service/services/tax-rate.service");
const request_context_1 = require("../../common/request-context");
const allow_decorator_1 = require("../../decorators/allow.decorator");
const request_context_decorator_1 = require("../../decorators/request-context.decorator");
const transaction_decorator_1 = require("../../decorators/transaction.decorator");
let TaxRateResolver = class TaxRateResolver {
    constructor(taxRateService) {
        this.taxRateService = taxRateService;
    }
    taxRates(ctx, args) {
        return this.taxRateService.findAll(ctx, args.options || undefined);
    }
    async taxRate(ctx, args) {
        return this.taxRateService.findOne(ctx, args.id);
    }
    async createTaxRate(ctx, args) {
        return this.taxRateService.create(ctx, args.input);
    }
    async updateTaxRate(ctx, args) {
        return this.taxRateService.update(ctx, args.input);
    }
    async deleteTaxRate(ctx, args) {
        return this.taxRateService.delete(ctx, args.id);
    }
};
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadSettings, generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadTaxRate),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], TaxRateResolver.prototype, "taxRates", null);
__decorate([
    graphql_1.Query(),
    allow_decorator_1.Allow(generated_types_1.Permission.ReadSettings, generated_types_1.Permission.ReadCatalog, generated_types_1.Permission.ReadTaxRate),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], TaxRateResolver.prototype, "taxRate", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.CreateSettings, generated_types_1.Permission.CreateTaxRate),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], TaxRateResolver.prototype, "createTaxRate", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.UpdateSettings, generated_types_1.Permission.UpdateTaxRate),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], TaxRateResolver.prototype, "updateTaxRate", null);
__decorate([
    transaction_decorator_1.Transaction(),
    graphql_1.Mutation(),
    allow_decorator_1.Allow(generated_types_1.Permission.DeleteSettings, generated_types_1.Permission.DeleteTaxRate),
    __param(0, request_context_decorator_1.Ctx()),
    __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_context_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], TaxRateResolver.prototype, "deleteTaxRate", null);
TaxRateResolver = __decorate([
    graphql_1.Resolver('TaxRate'),
    __metadata("design:paramtypes", [tax_rate_service_1.TaxRateService])
], TaxRateResolver);
exports.TaxRateResolver = TaxRateResolver;
//# sourceMappingURL=tax-rate.resolver.js.map