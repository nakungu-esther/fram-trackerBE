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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmDailyLogController = void 0;
const common_1 = require("@nestjs/common");
const farm_daily_log_service_1 = require("./farm-daily-log.service");
const create_farm_daily_log_dto_1 = require("./dto/create-farm-daily-log.dto");
const farm_daily_log_query_dto_1 = require("./dto/farm-daily-log-query.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let FarmDailyLogController = class FarmDailyLogController {
    constructor(farmDailyLogService) {
        this.farmDailyLogService = farmDailyLogService;
    }
    findAll(query, user) {
        return this.farmDailyLogService.findAll(query, user);
    }
    create(dto, user) {
        return this.farmDailyLogService.create(dto, user);
    }
};
exports.FarmDailyLogController = FarmDailyLogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [farm_daily_log_query_dto_1.FarmDailyLogQueryDto, Object]),
    __metadata("design:returntype", void 0)
], FarmDailyLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_farm_daily_log_dto_1.CreateFarmDailyLogDto, Object]),
    __metadata("design:returntype", void 0)
], FarmDailyLogController.prototype, "create", null);
exports.FarmDailyLogController = FarmDailyLogController = __decorate([
    (0, common_1.Controller)('api/farm-daily-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [farm_daily_log_service_1.FarmDailyLogService])
], FarmDailyLogController);
//# sourceMappingURL=farm-daily-log.controller.js.map