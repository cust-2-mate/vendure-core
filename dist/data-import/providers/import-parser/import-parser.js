"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportParser = void 0;
const common_1 = require("@nestjs/common");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const normalize_string_1 = require("@vendure/common/lib/normalize-string");
const unique_1 = require("@vendure/common/lib/unique");
const csv_parse_1 = __importDefault(require("csv-parse"));
const requiredColumns = [
    'name',
    'slug',
    'description',
    'assets',
    'facets',
    'optionGroups',
    'optionValues',
    'sku',
    'price',
    'taxCategory',
    'variantAssets',
    'variantFacets',
];
/**
 * Validates and parses CSV files into a data structure which can then be used to created new entities.
 */
let ImportParser = class ImportParser {
    async parseProducts(input) {
        const options = {
            trim: true,
            relax_column_count: true,
        };
        return new Promise((resolve, reject) => {
            let errors = [];
            if (typeof input === 'string') {
                csv_parse_1.default(input, options, (err, records) => {
                    if (err) {
                        errors = errors.concat(err);
                    }
                    if (records) {
                        const parseResult = this.processRawRecords(records);
                        errors = errors.concat(parseResult.errors);
                        resolve({ results: parseResult.results, errors, processed: parseResult.processed });
                    }
                    else {
                        resolve({ results: [], errors, processed: 0 });
                    }
                });
            }
            else {
                const parser = csv_parse_1.default(options);
                const records = [];
                // input.on('open', () => input.pipe(parser));
                input.pipe(parser);
                parser.on('readable', () => {
                    let record;
                    // tslint:disable-next-line:no-conditional-assignment
                    while ((record = parser.read())) {
                        records.push(record);
                    }
                });
                parser.on('error', reject);
                parser.on('end', () => {
                    const parseResult = this.processRawRecords(records);
                    errors = errors.concat(parseResult.errors);
                    resolve({ results: parseResult.results, errors, processed: parseResult.processed });
                });
            }
        });
    }
    processRawRecords(records) {
        const results = [];
        const errors = [];
        let currentRow;
        const headerRow = records[0];
        const rest = records.slice(1);
        const totalProducts = rest.map(row => row[0]).filter(name => name.trim() !== '').length;
        const columnError = validateRequiredColumns(headerRow);
        if (columnError) {
            return { results: [], errors: [columnError], processed: 0 };
        }
        let line = 1;
        for (const record of rest) {
            line++;
            const columnCountError = validateColumnCount(headerRow, record);
            if (columnCountError) {
                errors.push(columnCountError + ` on line ${line}`);
                continue;
            }
            const r = mapRowToObject(headerRow, record);
            if (r.name) {
                if (currentRow) {
                    populateOptionGroupValues(currentRow);
                    results.push(currentRow);
                }
                currentRow = {
                    product: parseProductFromRecord(r),
                    variants: [parseVariantFromRecord(r)],
                };
            }
            else {
                if (currentRow) {
                    currentRow.variants.push(parseVariantFromRecord(r));
                }
            }
            const optionError = validateOptionValueCount(r, currentRow);
            if (optionError) {
                errors.push(optionError + ` on line ${line}`);
            }
        }
        if (currentRow) {
            populateOptionGroupValues(currentRow);
            results.push(currentRow);
        }
        return { results, errors, processed: totalProducts };
    }
};
ImportParser = __decorate([
    common_1.Injectable()
], ImportParser);
exports.ImportParser = ImportParser;
function populateOptionGroupValues(currentRow) {
    const values = currentRow.variants.map(v => v.optionValues);
    currentRow.product.optionGroups.forEach((og, i) => {
        og.values = unique_1.unique(values.map(v => v[i]));
    });
}
function validateRequiredColumns(r) {
    const rowKeys = r;
    const missing = [];
    for (const col of requiredColumns) {
        if (!rowKeys.includes(col)) {
            missing.push(col);
        }
    }
    if (missing.length) {
        return `The import file is missing the following columns: ${missing.map(m => `"${m}"`).join(', ')}`;
    }
}
function validateColumnCount(columns, row) {
    if (columns.length !== row.length) {
        return `Invalid Record Length: header length is ${columns.length}, got ${row.length}`;
    }
}
function mapRowToObject(columns, row) {
    return row.reduce((obj, val, i) => {
        return Object.assign(Object.assign({}, obj), { [columns[i]]: val });
    }, {});
}
function validateOptionValueCount(r, currentRow) {
    if (!currentRow) {
        return;
    }
    const optionValues = parseStringArray(r.optionValues);
    if (currentRow.product.optionGroups.length !== optionValues.length) {
        return `The number of optionValues must match the number of optionGroups`;
    }
}
function parseProductFromRecord(r) {
    const name = parseString(r.name);
    const slug = parseString(r.slug) || normalize_string_1.normalizeString(name, '-');
    return {
        name,
        slug,
        description: parseString(r.description),
        assetPaths: parseStringArray(r.assets),
        optionGroups: parseStringArray(r.optionGroups).map(ogName => ({
            name: ogName,
            values: [],
        })),
        facets: parseStringArray(r.facets).map(pair => {
            const [facet, value] = pair.split(':');
            return { facet, value };
        }),
        customFields: parseCustomFields('product', r),
    };
}
function parseVariantFromRecord(r) {
    return {
        optionValues: parseStringArray(r.optionValues),
        sku: parseString(r.sku),
        price: parseNumber(r.price),
        taxCategory: parseString(r.taxCategory),
        stockOnHand: parseNumber(r.stockOnHand),
        trackInventory: r.trackInventory == null || r.trackInventory === ''
            ? generated_types_1.GlobalFlag.INHERIT
            : parseBoolean(r.trackInventory)
                ? generated_types_1.GlobalFlag.TRUE
                : generated_types_1.GlobalFlag.FALSE,
        assetPaths: parseStringArray(r.variantAssets),
        facets: parseStringArray(r.variantFacets).map(pair => {
            const [facet, value] = pair.split(':');
            return { facet, value };
        }),
        customFields: parseCustomFields('variant', r),
    };
}
function isRelationObject(value) {
    try {
        const parsed = JSON.parse(value);
        return parsed && parsed.hasOwnProperty('id');
    }
    catch (e) {
        return false;
    }
}
function parseCustomFields(prefix, r) {
    return Object.entries(r)
        .filter(([key, value]) => {
        return key.indexOf(`${prefix}:`) === 0;
    })
        .reduce((output, [key, value]) => {
        const fieldName = key.replace(`${prefix}:`, '');
        return Object.assign(Object.assign({}, output), { [fieldName]: isRelationObject(value) ? JSON.parse(value) : value });
    }, {});
}
function parseString(input) {
    return (input || '').trim();
}
function parseNumber(input) {
    return +(input || '').trim();
}
function parseBoolean(input) {
    if (input == null) {
        return false;
    }
    switch (input.toLowerCase()) {
        case 'true':
        case '1':
        case 'yes':
            return true;
        default:
            return false;
    }
}
function parseStringArray(input, separator = '|') {
    return (input || '')
        .trim()
        .split(separator)
        .map(s => s.trim())
        .filter(s => s !== '');
}
//# sourceMappingURL=import-parser.js.map