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
const audit_log_service_1 = require("../audit-log/audit-log.service");
function snapshotProcurement(row) {
    return {
        id: row.id,
        produce: row.produce,
        quantity: row.quantity,
        price: row.price,
        farmLocation: row.farmLocation,
        userId: row.userId,
        farmId: row.farmId,
        date: row.date,
        updatedAt: row.updatedAt,
        photoDataUrl: row.photoDataUrl ? '[photo]' : null,
        createdByUserId: row.createdByUserId,
        lastUpdatedByUserId: row.lastUpdatedByUserId,
    };
}
let ProcurementService = class ProcurementService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async isProcurementLocked(procurementId) {
        const linked = await this.prisma.sale.findMany({
            where: { procurementId },
        });
        return linked.some((s) => !!s.suiTxDigest ||
            (s.paymentStatus === 'paid' &&
                (s.amountPaid ?? 0) >= s.amount - 1e-9));
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
        if (dto.quantity < 0 || !Number.isFinite(dto.quantity)) {
            throw new common_1.BadRequestException('Harvest quantity cannot be negative');
        }
        const price = dto.price ?? 0;
        if (price < 0) {
            throw new common_1.BadRequestException('Price cannot be negative');
        }
        const farmId = dto.farmId?.trim() || null;
        await this.assertFarmOwned(farmId, userId);
        const created = await this.prisma.procurement.create({
            data: {
                produce: dto.produce.trim(),
                quantity: dto.quantity,
                price,
                farmLocation: dto.farmLocation?.trim() || null,
                userId,
                farmId,
                photoDataUrl: dto.photoDataUrl?.trim() || null,
                createdByUserId: auth.userId,
                lastUpdatedByUserId: auth.userId,
                ...(dto.date ? { date: new Date(dto.date) } : {}),
            },
        });
        await this.audit.record({
            action: 'CREATE_PROCUREMENT',
            entityType: 'Procurement',
            entityId: String(created.id),
            auth,
            newValue: snapshotProcurement(created),
        });
        return created;
    }
    async update(id, dto, auth) {
        const row = await this.prisma.procurement.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Procurement not found');
        if (auth.role !== 'admin' && row.userId !== auth.userId) {
            throw new common_1.ForbiddenException();
        }
        if (await this.isProcurementLocked(id)) {
            throw new common_1.BadRequestException('This harvest is linked to a finalized sale (paid or on-chain). Edits are disabled — add a new harvest/adjustment row instead of changing history.');
        }
        if (dto.farmId !== undefined) {
            const trimmed = dto.farmId?.trim() || null;
            if (trimmed) {
                await this.assertFarmOwned(trimmed, row.userId || auth.userId);
            }
        }
        if (dto.quantity !== undefined) {
            if (dto.quantity < 0 || !Number.isFinite(dto.quantity)) {
                throw new common_1.BadRequestException('Quantity cannot be negative');
            }
        }
        const before = snapshotProcurement(row);
        const data = {
            lastUpdatedByUser: { connect: { id: auth.userId } },
        };
        if (dto.produce !== undefined)
            data.produce = dto.produce.trim();
        if (dto.quantity !== undefined)
            data.quantity = dto.quantity;
        if (dto.farmLocation !== undefined) {
            data.farmLocation = dto.farmLocation?.trim() || null;
        }
        if (dto.date !== undefined)
            data.date = new Date(dto.date);
        if (dto.photoDataUrl !== undefined) {
            data.photoDataUrl = dto.photoDataUrl?.trim() || null;
        }
        if (dto.farmId !== undefined) {
            const trimmed = dto.farmId?.trim() || null;
            data.farm = trimmed
                ? { connect: { id: trimmed } }
                : { disconnect: true };
        }
        const updated = await this.prisma.procurement.update({
            where: { id },
            data,
        });
        await this.audit.record({
            action: 'UPDATE_PROCUREMENT',
            entityType: 'Procurement',
            entityId: String(id),
            auth,
            oldValue: before,
            newValue: snapshotProcurement(updated),
        });
        return updated;
    }
    async remove(id, auth) {
        const row = await this.prisma.procurement.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Procurement not found');
        if (auth.role !== 'admin' && row.userId !== auth.userId) {
            throw new common_1.ForbiddenException();
        }
        const saleCount = await this.prisma.sale.count({ where: { procurementId: id } });
        if (saleCount > 0) {
            throw new common_1.BadRequestException('Cannot delete harvest — one or more sales reference it. Keep the record for audit integrity.');
        }
        if (await this.isProcurementLocked(id)) {
            throw new common_1.BadRequestException('Cannot delete a harvest that is locked by finalized sales.');
        }
        await this.audit.record({
            action: 'DELETE_PROCUREMENT',
            entityType: 'Procurement',
            entityId: String(id),
            auth,
            oldValue: snapshotProcurement(row),
        });
        await this.prisma.procurement.delete({ where: { id } });
    }
};
exports.ProcurementService = ProcurementService;
exports.ProcurementService = ProcurementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], ProcurementService);
//# sourceMappingURL=procurement.service.js.map