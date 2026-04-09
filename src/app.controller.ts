import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root(): string {
    return 'FarmTrack API is running…';
  }

  @Get('api/health')
  health(): { ok: boolean; service: string } {
    return { ok: true, service: 'fram-tracker-be' };
  }
}
