/// <reference types="node" />
import { GlobalFlag, LanguageCode } from '@vendure/common/lib/generated-types';
import { Stream } from 'stream';
import { ConfigService } from '../../../config/config.service';
export interface ParsedOptionGroup {
    translations: Array<{
        languageCode: LanguageCode;
        name: string;
        values: string[];
    }>;
}
export interface ParsedFacet {
    translations: Array<{
        languageCode: LanguageCode;
        facet: string;
        value: string;
    }>;
}
export interface ParsedProductVariant {
    sku: string;
    price: number;
    taxCategory: string;
    stockOnHand: number;
    trackInventory: GlobalFlag;
    assetPaths: string[];
    facets: ParsedFacet[];
    translations: Array<{
        languageCode: LanguageCode;
        optionValues: string[];
        customFields: {
            [name: string]: string;
        };
    }>;
}
export interface ParsedProduct {
    assetPaths: string[];
    optionGroups: ParsedOptionGroup[];
    facets: ParsedFacet[];
    translations: Array<{
        languageCode: LanguageCode;
        name: string;
        slug: string;
        description: string;
        customFields: {
            [name: string]: string;
        };
    }>;
}
export interface ParsedProductWithVariants {
    product: ParsedProduct;
    variants: ParsedProductVariant[];
}
export interface ParseResult<T> {
    results: T[];
    errors: string[];
    processed: number;
}
/**
 * Validates and parses CSV files into a data structure which can then be used to created new entities.
 */
export declare class ImportParser {
    private configService;
    constructor(configService: ConfigService);
    parseProducts(input: string | Stream, mainLanguage?: LanguageCode): Promise<ParseResult<ParsedProductWithVariants>>;
    private processRawRecords;
    private validateCustomFields;
    private isTranslatable;
    private validateHeaderTranslations;
    private parseProductFromRecord;
    private parseVariantFromRecord;
}
