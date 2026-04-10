import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProcurementModule } from './procurement/procurement.module';
import { SaleModule } from './sale/sale.module';
import { AuthModule } from './auth/auth.module';
import { FarmModule } from './farm/farm.module';
import { ExpenseModule } from './expense/expense.module';
import { SeasonalPlanModule } from './seasonal-plan/seasonal-plan.module';
import { SupplyChainModule } from './supply-chain/supply-chain.module';
import { NotificationReadModule } from './notification-read/notification-read.module';
import { SmsLogModule } from './sms-log/sms-log.module';

@Module({
 imports: [
 ThrottlerModule.forRoot({
 throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
 }),
 PrismaModule,
 AuthModule,
 ProcurementModule,
 SaleModule,
 FarmModule,
 ExpenseModule,
 SeasonalPlanModule,
 SupplyChainModule,
 NotificationReadModule,
 SmsLogModule,
 ],
 controllers: [AppController],
})
export class AppModule {}
