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
exports.ProcurementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProcurementService = class ProcurementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, auth) {
        const where = {};
        if (auth.role === 'admin') {
            if (query.userId)
                where.userId = query.userId.trim();
        }
        else if (auth.role === 'trader') {
        }
        else {
            where.userId = auth.userId;
        }
        return this.prisma.procurement.findMany({
            where,
            orderBy: { date: 'desc' },
        });
    }
    async assertFarmOwned(farmId, userId) {
        if (!farmId)
            return;
        const farm = await this.prisma.farm.findFirst({
            where: { id: farmId, userId },
        });
        if (!farm) {
            throw new common_1.ForbiddenException('Farm not found or not owned by this user');
        }
    }
    async create(dto, auth) {
        if (auth.role === 'trader') {
            throw new common_1.ForbiddenException('Traders cannot record harvests');
        }
        let userId;
        if (auth.role === 'admin') {
            userId = (dto.userId?.trim() || auth.userId);
        }
        else {
            userId = auth.userId;
        }
        const price = dto.price ?? 0;
        const farmId = dto.farmId?.trim() || null;
        await this.assertFarmOwned(farmId, userId);
        return this.prisma.procurement.create({
            data: {
                produce: dto.produce.trim(),
                quantity: dto.quantity,
                price,
                farmLocation: dto.farmLocation?.trim() || null,
                userId,
                farmId,
                ...(dto.date ? { date: new Date(dto.date) } : {}),
            },
        });
    }
    async update(id, dto, auth) {
        const row = await this.prisma.procurement.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Procurement not found');
        if (auth.role !== 'admin' && row.userId !== auth.userId) {
            throw new common_1.ForbiddenException();
        }
        if (dto.farmId !== undefined) {
            const trimmed = dto.farmId?.trim() || null;
            if (trimmed) {
                await this.assertFarmOwned(trimmed, row.userId || auth.userId);
            }
        }
        const data = {};
        if (dto.produce !== undefined)
            data.produce = dto.produce.trim();
        if (dto.quantity !== undefined)
            data.quantity = dto.quantity;
        if (dto.farmLocation !== undefined) {
            data.farmLocation = dto.farmLocation?.trim() || null;
        }
        if (dto.date !== undefined)
            data.date = new Date(dto.date);
        if (dto.farmId !== undefined) {
            const trimmed = dto.farmId?.trim() || null;
            data.farm = trimmed
                ? { connect: { id: trimmed } }
                : { disconnect: true };
        }
        return this.prisma.procurement.update({
            where: { id },
            data,
        });
    }
    async remove(id, auth) {
        const row = await this.prisma.procurement.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Procurement not found');
        if (auth.role !== 'admin' && row.userId !== auth.userId) {
            throw new common_1.ForbiddenException();
        }
        await this.prisma.procurement.delete({ where: { id } });
    }
};
exports.ProcurementService = ProcurementService;
exports.ProcurementService = ProcurementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcurementService);
//# sourceMappingURL=procurement.service.js.map