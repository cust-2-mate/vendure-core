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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetImporter = void 0;
const common_1 = require("@nestjs/common");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_service_1 = require("../../../config/config.service");
const asset_service_1 = require("../../../service/services/asset.service");
let AssetImporter = class AssetImporter {
    constructor(configService, assetService) {
        this.configService = configService;
        this.assetService = assetService;
        this.assetMap = new Map();
    }
    /**
     * Creates Asset entities for the given paths, using the assetMap cache to prevent the
     * creation of duplicates.
     */
    async getAssets(assetPaths) {
        const assets = [];
        const errors = [];
        const { importAssetsDir } = this.configService.importExportOptions;
        const uniqueAssetPaths = new Set(assetPaths);
        for (const assetPath of uniqueAssetPaths.values()) {
            const cachedAsset = this.assetMap.get(assetPath);
            if (cachedAsset) {
                assets.push(cachedAsset);
            }
            else {
                const filename = path_1.default.join(importAssetsDir, assetPath);
                if (fs_extra_1.default.existsSync(filename)) {
                    const fileStat = fs_extra_1.default.statSync(filename);
                    if (fileStat.isFile()) {
                        try {
                            const stream = fs_extra_1.default.createReadStream(filename);
                            const asset = (await this.assetService.createFromFileStream(stream));
                            this.assetMap.set(assetPath, asset);
                            assets.push(asset);
                        }
                        catch (err) {
                            errors.push(err.toString());
                        }
                    }
                }
                else {
                    errors.push(`File "${filename}" does not exist`);
                }
            }
        }
        return { assets, errors };
    }
};
AssetImporter = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_service_1.ConfigService, asset_service_1.AssetService])
], AssetImporter);
exports.AssetImporter = AssetImporter;
//# sourceMappingURL=asset-importer.js.map