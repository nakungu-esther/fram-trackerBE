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
exports.SmsLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SmsLogService = class SmsLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(auth) {
        if (auth.role === 'admin') {
            return this.prisma.smsLog.findMany({
                orderBy: { at: 'desc' },
                take: 500,
            });
        }
        return this.prisma.smsLog.findMany({
            where: { userId: auth.userId },
            orderBy: { at: 'desc' },
            take: 200,
        });
    }
    async create(dto, auth) {
        return this.prisma.smsLog.create({
            data: {
                userId: auth.userId,
                to: dto.to.trim(),
                body: dto.body.trim(),
                kind: dto.kind.trim(),
            },
        });
    }
};
exports.SmsLogService = SmsLogService;
exports.SmsLogService = SmsLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsLogService);
//# sourceMappingURL=sms-log.service.js.map