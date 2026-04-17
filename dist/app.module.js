"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const procurement_module_1 = require("./procurement/procurement.module");
const sale_module_1 = require("./sale/sale.module");
const auth_module_1 = require("./auth/auth.module");
const farm_module_1 = require("./farm/farm.module");
const expense_module_1 = require("./expense/expense.module");
const seasonal_plan_module_1 = require("./seasonal-plan/seasonal-plan.module");
const supply_chain_module_1 = require("./supply-chain/supply-chain.module");
const notification_read_module_1 = require("./notification-read/notification-read.module");
const sms_log_module_1 = require("./sms-log/sms-log.module");
const farm_daily_log_module_1 = require("./farm-daily-log/farm-daily-log.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
            }),
            prisma_module_1.PrismaModule,
            audit_log_module_1.AuditLogModule,
            auth_module_1.AuthModule,
            procurement_module_1.ProcurementModule,
            sale_module_1.SaleModule,
            farm_module_1.FarmModule,
            expense_module_1.ExpenseModule,
            seasonal_plan_module_1.SeasonalPlanModule,
            supply_chain_module_1.SupplyChainModule,
            notification_read_module_1.NotificationReadModule,
            sms_log_module_1.SmsLogModule,
            farm_daily_log_module_1.FarmDailyLogModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map