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
exports.SlugValidator = void 0;
const common_1 = require("@nestjs/common");
const normalize_string_1 = require("@vendure/common/lib/normalize-string");
const transactional_connection_1 = require("../../../connection/transactional-connection");
let SlugValidator = class SlugValidator {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Normalizes the slug to be URL-safe, and ensures it is unique for the given languageCode.
     * Mutates the input.
     */
    async validateSlugs(ctx, input, translationEntity) {
        if (input.translations) {
            for (const t of input.translations) {
                if (t.slug) {
                    t.slug = normalize_string_1.normalizeString(t.slug, '-');
                    let match;
                    let suffix = 1;
                    const alreadySuffixed = /-\d+$/;
                    do {
                        const qb = this.connection
                            .getRepository(ctx, translationEntity)
                            .createQueryBuilder('translation')
                            .innerJoinAndSelect('translation.base', 'base')
                            .where(`translation.slug = :slug`, { slug: t.slug })
                            .andWhere(`translation.languageCode = :languageCode`, {
                            languageCode: t.languageCode,
                        });
                        if (input.id) {
                            qb.andWhere(`translation.base != :id`, { id: input.id });
                        }
                        match = await qb.getOne();
                        if (match && !match.base.deletedAt) {
                            suffix++;
                            if (alreadySuffixed.test(t.slug)) {
                                t.slug = t.slug.replace(alreadySuffixed, `-${suffix}`);
                            }
                            else {
                                t.slug = `${t.slug}-${suffix}`;
                            }
                        }
                    } while (match && !match.base.deletedAt);
                }
            }
        }
        return input;
    }
};
SlugValidator = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [transactional_connection_1.TransactionalConnection])
], SlugValidator);
exports.SlugValidator = SlugValidator;
//# sourceMappingURL=slug-validator.js.map