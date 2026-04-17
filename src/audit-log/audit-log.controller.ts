import { Controller, Get, ForbiddenException, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins may view the audit log');
    }
    return this.auditLogService.findRecent(250);
  }
}
