import {Module} from '@nestjs/common';
import {RaspberryController} from './raspberry.controller';
import {RaspberryService} from './raspberry.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TelegrafModule} from 'nestjs-telegraf';
import {ScheduleModule} from '@nestjs/schedule';
import {WarmupService} from './services/warmup/warmup.service';
import {TasksService} from './services/tasks/tasks.service';
import {PowerService} from './services/power/power.service';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN || '',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [RaspberryController],
  providers: [RaspberryService, WarmupService, TasksService, PowerService],
})
export class RaspberryModule {}
