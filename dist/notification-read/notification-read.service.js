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
exports.NotificationReadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationReadService = class NotificationReadService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKeys(auth) {
        const rows = await this.prisma.notificationRead.findMany({
            where: { userId: auth.userId },
            select: { key: true },
        });
        return { keys: rows.map((r) => r.key) };
    }
    async markRead(auth, key) {
        const k = key.trim();
        if (!k)
            return { ok: true };
        await this.prisma.notificationRead.upsert({
            where: {
                userId_key: { userId: auth.userId, key: k },
            },
            create: { userId: auth.userId, key: k },
            update: {},
        });
        return { ok: true };
    }
};
exports.NotificationReadService = NotificationReadService;
exports.NotificationReadService = NotificationReadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationReadService);
//# sourceMappingURL=notification-read.service.js.map