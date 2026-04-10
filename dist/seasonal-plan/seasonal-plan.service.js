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
exports.SeasonalPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SeasonalPlanService = class SeasonalPlanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(auth) {
        if (auth.role === 'admin') {
            return this.prisma.seasonalPlan.findMany({ orderBy: { plantDate: 'desc' } });
        }
        if (auth.role === 'trader')
            return [];
        return this.prisma.seasonalPlan.findMany({
            where: { userId: auth.userId },
            orderBy: { plantDate: 'desc' },
        });
    }
    async assertFarmOwned(farmId, userId) {
        if (!farmId)
            return;
        const farm = await this.prisma.farm.findFirst({
            where: { id: farmId, userId },
        });
        if (!farm)
            throw new common_1.ForbiddenException('Farm not found or not owned by this user');
    }
    async create(dto, auth) {
        if (auth.role === 'trader')
            throw new common_1.ForbiddenException();
        const farmId = dto.farmId?.trim() || null;
        await this.assertFarmOwned(farmId, auth.userId);
        return this.prisma.seasonalPlan.create({
            data: {
                userId: auth.userId,
                crop: dto.crop.trim(),
                plantDate: new Date(dto.plantDate),
                expectedHarvestDate: new Date(dto.expectedHarvestDate),
                farmId,
                notes: dto.notes?.trim() || null,
            },
        });
    }
};
exports.SeasonalPlanService = SeasonalPlanService;
exports.SeasonalPlanService = SeasonalPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeasonalPlanService);
//# sourceMappingURL=seasonal-plan.service.js.map