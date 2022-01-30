/// <reference types="node" />
import { ImportInfo, LanguageCode } from '@vendure/common/lib/generated-types';
import { Observable } from 'rxjs';
import { Stream } from 'stream';
import { RequestContext } from '../../../api/common/request-context';
import { ConfigService } from '../../../config/config.service';
import { ChannelService } from '../../../service/services/channel.service';
import { FacetValueService } from '../../../service/services/facet-value.service';
import { FacetService } from '../../../service/services/facet.service';
import { TaxCategoryService } from '../../../service/services/tax-category.service';
import { AssetImporter } from '../asset-importer/asset-importer';
import { ImportParser } from '../import-parser/import-parser';
import { FastImporterService } from './fast-importer.service';
export interface ImportProgress extends ImportInfo {
    currentProduct: string;
}
export declare type OnProgressFn = (progess: ImportProgress) => void;
export declare class Importer {
    private configService;
    private importParser;
    private channelService;
    private facetService;
    private facetValueService;
    private taxCategoryService;
    private assetImporter;
    private fastImporter;
    private taxCategoryMatches;
    private facetMap;
    private facetValueMap;
    constructor(configService: ConfigService, importParser: ImportParser, channelService: ChannelService, facetService: FacetService, facetValueService: FacetValueService, taxCategoryService: TaxCategoryService, assetImporter: AssetImporter, fastImporter: FastImporterService);
    parseAndImport(input: string | Stream, ctxOrLanguageCode: RequestContext | LanguageCode, reportProgress?: boolean): Observable<ImportProgress>;
    private doParseAndImport;
    private getRequestContext;
    /**
     * Imports the products specified in the rows object. Return an array of error messages.
     */
    private importProducts;
    private getFacetValueIds;
    private processCustomFieldValues;
    /**
     * Attempts to match a TaxCategory entity against the name supplied in the import table. If no matches
     * are found, the first TaxCategory id is returned.
     */
    private getMatchingTaxCategoryId;
    private getTranslationByCodeOrFirst;
}
