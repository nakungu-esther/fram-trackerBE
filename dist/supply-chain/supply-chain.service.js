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
exports.SupplyChainService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupplyChainService = class SupplyChainService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    saleKeysForAuth(auth) {
        if (auth.role === 'admin') {
            return this.prisma.sale
                .findMany({ select: { id: true } })
                .then((rows) => rows.map((r) => `api-${r.id}`));
        }
        if (auth.role === 'trader') {
            const name = auth.name?.trim();
            if (!name)
                return Promise.resolve([]);
            return this.prisma.sale
                .findMany({
                where: { buyer: { equals: name, mode: 'insensitive' } },
                select: { id: true },
            })
                .then((rows) => rows.map((r) => `api-${r.id}`));
        }
        return this.prisma.sale
            .findMany({
            where: { userId: auth.userId },
            select: { id: true },
        })
            .then((rows) => rows.map((r) => `api-${r.id}`));
    }
    async findAll(auth) {
        const keys = await this.saleKeysForAuth(auth);
        if (auth.role === 'admin') {
            return this.prisma.supplyChainEvent.findMany({ orderBy: { at: 'asc' } });
        }
        return this.prisma.supplyChainEvent.findMany({
            where: {
                OR: [{ saleId: { in: keys } }, { userId: auth.userId }],
            },
            orderBy: { at: 'asc' },
        });
    }
    async create(dto, auth) {
        return this.prisma.supplyChainEvent.create({
            data: {
                saleId: dto.saleId.trim(),
                stage: dto.stage.trim(),
                note: dto.note?.trim() || null,
                userId: auth.userId,
            },
        });
    }
};
exports.SupplyChainService = SupplyChainService;
exports.SupplyChainService = SupplyChainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupplyChainService);
//# sourceMappingURL=supply-chain.service.js.map