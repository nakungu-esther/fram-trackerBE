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
exports.FarmDailyLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let FarmDailyLogService = class FarmDailyLogService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(query, auth) {
        const where = {};
        if (auth.role === 'farmer') {
            where.userId = auth.userId;
        }
        else if (auth.role === 'admin') {
            if (query.userId?.trim())
                where.userId = query.userId.trim();
        }
        return this.prisma.farmDailyLog.findMany({
            where,
            orderBy: [{ logDate: 'desc' }, { createdAt: 'desc' }],
            take: 500,
        });
    }
    async create(dto, auth) {
        if (auth.role !== 'farmer') {
            throw new common_1.ForbiddenException('Only farmer accounts may submit daily farm logs');
        }
        const userId = auth.userId;
        const logDate = new Date(`${dto.logDate.slice(0, 10)}T12:00:00.000Z`);
        if (dto.expenseAmount != null &&
            (dto.expenseAmount < 0 || !Number.isFinite(dto.expenseAmount))) {
            throw new common_1.BadRequestException('Expense amount cannot be negative');
        }
        const created = await this.prisma.farmDailyLog.create({
            data: {
                userId,
                logDate,
                activities: dto.activities.trim(),
                expenseNote: dto.expenseNote?.trim() || null,
                expenseAmount: dto.expenseAmount != null && Number.isFinite(dto.expenseAmount)
                    ? dto.expenseAmount
                    : null,
                issues: dto.issues?.trim() || null,
                photoDataUrl: dto.photoDataUrl?.trim() || null,
            },
        });
        await this.audit.record({
            action: 'CREATE_FARM_DAILY_LOG',
            entityType: 'FarmDailyLog',
            entityId: created.id,
            auth,
            newValue: {
                id: created.id,
                userId: created.userId,
                logDate: created.logDate,
                activities: created.activities,
                expenseNote: created.expenseNote,
                expenseAmount: created.expenseAmount,
                issues: created.issues,
                hasPhoto: !!created.photoDataUrl,
            },
        });
        return created;
    }
};
exports.FarmDailyLogService = FarmDailyLogService;
exports.FarmDailyLogService = FarmDailyLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], FarmDailyLogService);
//# sourceMappingURL=farm-daily-log.service.js.map