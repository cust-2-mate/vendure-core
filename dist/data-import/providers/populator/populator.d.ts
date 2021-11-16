import { CollectionService, FacetValueService, PaymentMethodService, RoleService, ShippingMethodService } from '../../../service';
import { ChannelService } from '../../../service/services/channel.service';
import { CountryService } from '../../../service/services/country.service';
import { SearchService } from '../../../service/services/search.service';
import { TaxCategoryService } from '../../../service/services/tax-category.service';
import { TaxRateService } from '../../../service/services/tax-rate.service';
import { ZoneService } from '../../../service/services/zone.service';
import { InitialData } from '../../types';
import { AssetImporter } from '../asset-importer/asset-importer';
/**
 * Responsible for populating the database with initial data.
 */
export declare class Populator {
    private countryService;
    private zoneService;
    private channelService;
    private taxRateService;
    private taxCategoryService;
    private shippingMethodService;
    private paymentMethodService;
    private collectionService;
    private facetValueService;
    private searchService;
    private assetImporter;
    private roleService;
    constructor(countryService: CountryService, zoneService: ZoneService, channelService: ChannelService, taxRateService: TaxRateService, taxCategoryService: TaxCategoryService, shippingMethodService: ShippingMethodService, paymentMethodService: PaymentMethodService, collectionService: CollectionService, facetValueService: FacetValueService, searchService: SearchService, assetImporter: AssetImporter, roleService: RoleService);
    /**
     * Should be run *before* populating the products, so that there are TaxRates by which
     * product prices can be set.
     */
    populateInitialData(data: InitialData): Promise<void>;
    /**
     * Should be run *after* the products have been populated, otherwise the expected FacetValues will not
     * yet exist.
     */
    populateCollections(data: InitialData): Promise<void>;
    private processFilterDefinition;
    private createRequestContext;
    private setChannelDefaults;
    private populateCountries;
    private populateTaxRates;
    private populateShippingMethods;
    private populatePaymentMethods;
    private populateRoles;
}
