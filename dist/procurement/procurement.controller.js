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
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const procurement_service_1 = require("./procurement.service");
const create_procurement_dto_1 = require("./dto/create-procurement.dto");
const update_procurement_dto_1 = require("./dto/update-procurement.dto");
const procurement_query_dto_1 = require("./dto/procurement-query.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ProcurementController = class ProcurementController {
    constructor(procurementService) {
        this.procurementService = procurementService;
    }
    findAll(query, user) {
        return this.procurementService.findAll(query, user);
    }
    create(dto, user) {
        return this.procurementService.create(dto, user);
    }
    update(id, dto, user) {
        return this.procurementService.update(id, dto, user);
    }
    remove(id, user) {
        return this.procurementService.remove(id, user);
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [procurement_query_dto_1.ProcurementQueryDto, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_procurement_dto_1.CreateProcurementDto, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_procurement_dto_1.UpdateProcurementDto, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "remove", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, common_1.Controller)('api/procurements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [procurement_service_1.ProcurementService])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map