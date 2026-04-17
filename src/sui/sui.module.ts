import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SuiVerificationService } from './sui-verification.service';

@Module({
  imports: [PrismaModule],
  providers: [SuiVerificationService],
  exports: [SuiVerificationService],
})
export class SuiModule {}
