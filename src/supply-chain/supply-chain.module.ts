import { Module } from '@nestjs/common';
import { SupplyChainService } from './supply-chain.service';
import { SupplyChainController } from './supply-chain.controller';

@Module({
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
})
export class SupplyChainModule {}
