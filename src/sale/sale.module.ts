import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SuiModule } from '../sui/sui.module';

@Module({
  imports: [SuiModule],
  controllers: [SaleController],
  providers: [SaleService],
})
export class SaleModule {}
