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
exports.SupplyChainController = void 0;
const common_1 = require("@nestjs/common");
const supply_chain_service_1 = require("./supply-chain.service");
const create_supply_event_dto_1 = require("./dto/create-supply-event.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let SupplyChainController = class SupplyChainController {
    constructor(supplyChainService) {
        this.supplyChainService = supplyChainService;
    }
    findAll(user) {
        return this.supplyChainService.findAll(user);
    }
    create(dto, user) {
        return this.supplyChainService.create(dto, user);
    }
};
exports.SupplyChainController = SupplyChainController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SupplyChainController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_supply_event_dto_1.CreateSupplyEventDto, Object]),
    __metadata("design:returntype", void 0)
], SupplyChainController.prototype, "create", null);
exports.SupplyChainController = SupplyChainController = __decorate([
    (0, common_1.Controller)('api/supply-chain-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [supply_chain_service_1.SupplyChainService])
], SupplyChainController);
//# sourceMappingURL=supply-chain.controller.js.map