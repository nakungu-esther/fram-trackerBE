"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonalPlanModule = void 0;
const common_1 = require("@nestjs/common");
const seasonal_plan_service_1 = require("./seasonal-plan.service");
const seasonal_plan_controller_1 = require("./seasonal-plan.controller");
let SeasonalPlanModule = class SeasonalPlanModule {
};
exports.SeasonalPlanModule = SeasonalPlanModule;
exports.SeasonalPlanModule = SeasonalPlanModule = __decorate([
    (0, common_1.Module)({
        controllers: [seasonal_plan_controller_1.SeasonalPlanController],
        providers: [seasonal_plan_service_1.SeasonalPlanService],
    })
], SeasonalPlanModule);
//# sourceMappingURL=seasonal-plan.module.js.map