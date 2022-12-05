import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { WarmupServiceService } from './services/warmup-service/warmup-service.service';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN || ""
    })
  ],
  controllers: [ServerController],
  providers: [ServerService, WarmupServiceService],
})
export class ServerModule {}
