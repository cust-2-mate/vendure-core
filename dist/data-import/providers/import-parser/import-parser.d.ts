/// <reference types="node" />
import { GlobalFlag } from '@vendure/common/lib/generated-types';
import { Stream } from 'stream';
export declare type BaseProductRecord = {
    name?: string;
    slug?: string;
    description?: string;
    assets?: string;
    facets?: string;
    optionGroups?: string;
    optionValues?: string;
    sku?: string;
    price?: string;
    taxCategory?: string;
    stockOnHand?: string;
    trackInventory?: string;
    variantAssets?: string;
    variantFacets?: string;
};
export declare type RawProductRecord = BaseProductRecord & {
    [customFieldName: string]: string;
};
export interface ParsedProductVariant {
    optionValues: string[];
    sku: string;
    price: number;
    taxCategory: string;
    stockOnHand: number;
    trackInventory: GlobalFlag;
    assetPaths: string[];
    facets: Array<{
        facet: string;
        value: string;
    }>;
    customFields: {
        [name: string]: string;
    };
}
export interface ParsedProduct {
    name: string;
    slug: string;
    description: string;
    assetPaths: string[];
    optionGroups: Array<{
        name: string;
        values: string[];
    }>;
    facets: Array<{
        facet: string;
        value: string;
    }>;
    customFields: {
        [name: string]: string;
    };
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
    parseProducts(input: string | Stream): Promise<ParseResult<ParsedProductWithVariants>>;
    private processRawRecords;
}
