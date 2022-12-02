import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { WarmupServiceService } from './services/warmup-service/warmup-service.service';

@Module({
  imports: [],
  controllers: [ServerController],
  providers: [ServerService, WarmupServiceService],
})
export class ServerModule {}
