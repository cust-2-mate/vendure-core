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
exports.Populator = void 0;
const common_1 = require("@nestjs/common");
const normalize_string_1 = require("@vendure/common/lib/normalize-string");
const shared_utils_1 = require("@vendure/common/lib/shared-utils");
const request_context_1 = require("../../../api/common/request-context");
const config_1 = require("../../../config");
const manual_fulfillment_handler_1 = require("../../../config/fulfillment/manual-fulfillment-handler");
const service_1 = require("../../../service");
const channel_service_1 = require("../../../service/services/channel.service");
const country_service_1 = require("../../../service/services/country.service");
const search_service_1 = require("../../../service/services/search.service");
const tax_category_service_1 = require("../../../service/services/tax-category.service");
const tax_rate_service_1 = require("../../../service/services/tax-rate.service");
const zone_service_1 = require("../../../service/services/zone.service");
const asset_importer_1 = require("../asset-importer/asset-importer");
/**
 * Responsible for populating the database with initial data.
 */
let Populator = class Populator {
    constructor(countryService, zoneService, channelService, taxRateService, taxCategoryService, shippingMethodService, paymentMethodService, collectionService, facetValueService, searchService, assetImporter, roleService) {
        this.countryService = countryService;
        this.zoneService = zoneService;
        this.channelService = channelService;
        this.taxRateService = taxRateService;
        this.taxCategoryService = taxCategoryService;
        this.shippingMethodService = shippingMethodService;
        this.paymentMethodService = paymentMethodService;
        this.collectionService = collectionService;
        this.facetValueService = facetValueService;
        this.searchService = searchService;
        this.assetImporter = assetImporter;
        this.roleService = roleService;
    }
    /**
     * Should be run *before* populating the products, so that there are TaxRates by which
     * product prices can be set.
     */
    async populateInitialData(data) {
        const { channel, ctx } = await this.createRequestContext(data);
        let zoneMap;
        try {
            zoneMap = await this.populateCountries(ctx, data.countries);
        }
        catch (e) {
            config_1.Logger.error(`Could not populate countries`);
            config_1.Logger.error(e, 'populator', e.stack);
            throw e;
        }
        try {
            await this.populateTaxRates(ctx, data.taxRates, zoneMap);
        }
        catch (e) {
            config_1.Logger.error(`Could not populate tax rates`);
            config_1.Logger.error(e, 'populator', e.stack);
        }
        try {
            await this.populateShippingMethods(ctx, data.shippingMethods);
        }
        catch (e) {
            config_1.Logger.error(`Could not populate shipping methods`);
            config_1.Logger.error(e, 'populator', e.stack);
        }
        try {
            await this.populatePaymentMethods(ctx, data.paymentMethods);
        }
        catch (e) {
            config_1.Logger.error(`Could not populate payment methods`);
            config_1.Logger.error(e, 'populator', e.stack);
        }
        try {
            await this.setChannelDefaults(zoneMap, data, channel);
        }
        catch (e) {
            config_1.Logger.error(`Could not set channel defaults`);
            config_1.Logger.error(e, 'populator', e.stack);
        }
        try {
            await this.populateRoles(ctx, data.roles);
        }
        catch (e) {
            config_1.Logger.error(`Could not populate roles`);
            config_1.Logger.error(e, 'populator', e.stack);
        }
    }
    /**
     * Should be run *after* the products have been populated, otherwise the expected FacetValues will not
     * yet exist.
     */
    async populateCollections(data) {
        var _a;
        const { ctx } = await this.createRequestContext(data);
        const allFacetValues = await this.facetValueService.findAll(ctx.languageCode);
        const collectionMap = new Map();
        for (const collectionDef of data.collections) {
            const parent = collectionDef.parentName && collectionMap.get(collectionDef.parentName);
            const parentId = parent ? parent.id.toString() : undefined;
            const { assets } = await this.assetImporter.getAssets(collectionDef.assetPaths || []);
            const collection = await this.collectionService.create(ctx, {
                translations: [
                    {
                        languageCode: ctx.languageCode,
                        name: collectionDef.name,
                        description: collectionDef.description || '',
                        slug: (_a = collectionDef.slug) !== null && _a !== void 0 ? _a : collectionDef.name,
                    },
                ],
                isPrivate: collectionDef.private || false,
                parentId,
                assetIds: assets.map(a => a.id.toString()),
                featuredAssetId: assets.length ? assets[0].id.toString() : undefined,
                filters: (collectionDef.filters || []).map(filter => this.processFilterDefinition(filter, allFacetValues)),
            });
            collectionMap.set(collectionDef.name, collection);
        }
        // Wait for the created collection operations to complete before running
        // the reindex of the search index.
        await new Promise(resolve => setTimeout(resolve, 50));
        await this.searchService.reindex(ctx);
    }
    processFilterDefinition(filter, allFacetValues) {
        switch (filter.code) {
            case 'facet-value-filter':
                const facetValueIds = filter.args.facetValueNames
                    .map(name => allFacetValues.find(fv => {
                    let facetName;
                    let valueName = name;
                    if (name.includes(':')) {
                        [facetName, valueName] = name.split(':');
                        return ((fv.name === valueName || fv.code === valueName) &&
                            (fv.facet.name === facetName || fv.facet.code === facetName));
                    }
                    else {
                        return fv.name === valueName || fv.code === valueName;
                    }
                }))
                    .filter(shared_utils_1.notNullOrUndefined)
                    .map(fv => fv.id);
                return {
                    code: filter.code,
                    arguments: [
                        {
                            name: 'facetValueIds',
                            value: JSON.stringify(facetValueIds),
                        },
                        {
                            name: 'containsAny',
                            value: filter.args.containsAny.toString(),
                        },
                    ],
                };
            default:
                throw new Error(`Filter with code "${filter.code}" is not recognized.`);
        }
    }
    async createRequestContext(data) {
        const channel = await this.channelService.getDefaultChannel();
        const ctx = new request_context_1.RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            channel,
            languageCode: data.defaultLanguage,
        });
        return { channel, ctx };
    }
    async setChannelDefaults(zoneMap, data, channel) {
        const defaultZone = zoneMap.get(data.defaultZone);
        if (!defaultZone) {
            throw new Error(`The defaultZone (${data.defaultZone}) did not match any zones from the InitialData`);
        }
        const defaultZoneId = defaultZone.entity.id;
        await this.channelService.update(request_context_1.RequestContext.empty(), {
            id: channel.id,
            defaultTaxZoneId: defaultZoneId,
            defaultShippingZoneId: defaultZoneId,
        });
    }
    async populateCountries(ctx, countries) {
        const zones = new Map();
        for (const { name, code, zone } of countries) {
            const countryEntity = await this.countryService.create(ctx, {
                code,
                enabled: true,
                translations: [{ languageCode: ctx.languageCode, name }],
            });
            let zoneItem = zones.get(zone);
            if (!zoneItem) {
                const zoneEntity = await this.zoneService.create(ctx, { name: zone });
                zoneItem = { entity: zoneEntity, members: [] };
                zones.set(zone, zoneItem);
            }
            zoneItem.members.push(countryEntity.id);
        }
        // add the countries to the respective zones
        for (const zoneItem of zones.values()) {
            await this.zoneService.addMembersToZone(ctx, {
                zoneId: zoneItem.entity.id,
                memberIds: zoneItem.members,
            });
        }
        return zones;
    }
    async populateTaxRates(ctx, taxRates, zoneMap) {
        const taxCategories = [];
        for (const taxRate of taxRates) {
            const category = await this.taxCategoryService.create(ctx, { name: taxRate.name });
            for (const { entity } of zoneMap.values()) {
                await this.taxRateService.create(ctx, {
                    zoneId: entity.id,
                    value: taxRate.percentage,
                    categoryId: category.id,
                    name: `${taxRate.name} ${entity.name}`,
                    enabled: true,
                });
            }
        }
    }
    async populateShippingMethods(ctx, shippingMethods) {
        for (const method of shippingMethods) {
            await this.shippingMethodService.create(ctx, {
                fulfillmentHandler: manual_fulfillment_handler_1.manualFulfillmentHandler.code,
                checker: {
                    code: config_1.defaultShippingEligibilityChecker.code,
                    arguments: [{ name: 'orderMinimum', value: '0' }],
                },
                calculator: {
                    code: config_1.defaultShippingCalculator.code,
                    arguments: [
                        { name: 'rate', value: method.price.toString() },
                        { name: 'taxRate', value: '0' },
                        { name: 'includesTax', value: 'auto' },
                    ],
                },
                code: normalize_string_1.normalizeString(method.name, '-'),
                translations: [{ languageCode: ctx.languageCode, name: method.name, description: '' }],
            });
        }
    }
    async populatePaymentMethods(ctx, paymentMethods) {
        for (const method of paymentMethods) {
            await this.paymentMethodService.create(ctx, {
                name: method.name,
                code: normalize_string_1.normalizeString(method.name, '-'),
                description: '',
                enabled: true,
                handler: method.handler,
            });
        }
    }
    async populateRoles(ctx, roles) {
        if (!roles) {
            return;
        }
        for (const roleDef of roles) {
            await this.roleService.create(ctx, roleDef);
        }
    }
};
Populator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [country_service_1.CountryService,
        zone_service_1.ZoneService,
        channel_service_1.ChannelService,
        tax_rate_service_1.TaxRateService,
        tax_category_service_1.TaxCategoryService,
        service_1.ShippingMethodService,
        service_1.PaymentMethodService,
        service_1.CollectionService,
        service_1.FacetValueService,
        search_service_1.SearchService,
        asset_importer_1.AssetImporter,
        service_1.RoleService])
], Populator);
exports.Populator = Populator;
//# sourceMappingURL=populator.js.map