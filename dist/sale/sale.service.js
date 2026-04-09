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
exports.SaleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function normalizeAmountPaid(total, paymentStatus, amountPaidRaw) {
    let paid = amountPaidRaw !== undefined && amountPaidRaw !== null
        ? amountPaidRaw
        : total;
    if (paymentStatus === 'credit')
        paid = 0;
    if (paymentStatus === 'partial')
        paid = Math.min(paid, total);
    if (paymentStatus === 'paid')
        paid = total;
    return paid;
}
let SaleService = class SaleService {
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
            const name = auth.name?.trim();
            if (name) {
                where.buyer = { equals: name, mode: 'insensitive' };
            }
            else {
                where.buyer = { equals: '__none__' };
            }
        }
        else {
            where.userId = auth.userId;
        }
        return this.prisma.sale.findMany({
            where,
            orderBy: { date: 'desc' },
        });
    }
    async create(dto, auth) {
        if (auth.role === 'trader') {
            throw new common_1.ForbiddenException('Traders cannot record farmer sales');
        }
        let userId;
        if (auth.role === 'admin') {
            userId = (dto.userId?.trim() || auth.userId);
        }
        else {
            userId = auth.userId;
        }
        const total = dto.amount;
        const paymentStatus = dto.paymentStatus ?? 'paid';
        const paid = normalizeAmountPaid(total, paymentStatus, dto.amountPaid);
        return this.prisma.sale.create({
            data: {
                produce: dto.produce.trim(),
                quantity: dto.quantity,
                amount: total,
                buyer: dto.buyer.trim(),
                paymentStatus,
                amountPaid: paid,
                creditDueDate: dto.creditDueDate ? new Date(dto.creditDueDate) : null,
                userId,
                ...(dto.date ? { date: new Date(dto.date) } : {}),
            },
        });
    }
};
exports.SaleService = SaleService;
exports.SaleService = SaleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SaleService);
//# sourceMappingURL=sale.service.js.map