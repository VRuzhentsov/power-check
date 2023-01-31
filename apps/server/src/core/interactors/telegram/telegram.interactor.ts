import {Inject, OnModuleInit} from '@nestjs/common';
import {Context, Telegraf, Markup} from 'telegraf';
import {
  Update,
  Ctx,
  Start,
  Help,
  InjectBot,
  Command,
  Scene,
} from 'nestjs-telegraf';
import {LoggerService} from '../../logger/logger.service';
import DeviceRepository from '../../repositories/device.repository';
import {Device} from '@prisma/client';

@Update()
@Scene('device')
export class TelegramInteractor implements OnModuleInit {
  constructor(
    @InjectBot()
    private readonly bot: Telegraf<Context>,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
    @Inject(DeviceRepository)
    private readonly deviceRepository: DeviceRepository
  ) {}

  @Start()
  @Help()
  async onStart(@Ctx() context: Context) {
    context.reply(
      'Hi!\n' + 'Comands: /start, /devices',
      Markup.keyboard(['/start', '/devices']).resize().selective()
    );
  }

  @Command('devices')
  async devices(@Ctx() context: Context) {
    const devices = await this.deviceRepository.findAll();

    const formatMessage = (device: Device) => {
      // isOnline variable, that shows if lastOnline value longer then 1 minute from now;
      const isOnline =
        new Date().getTime() - device.lastOnline.getTime() < 60000;
      const onlineEmoji = '\u{1F7E2}';
      const offlineEmoji = '\u{1F534}';

      return `${device.name}: ${
        isOnline
          ? onlineEmoji
          : offlineEmoji + ' ' + device.lastOnline.toLocaleString()
      }  `;
    };

    context.reply(
      'Last online time of devices: \n' + devices.map(formatMessage).join('\n')
    );
  }
  @Command('online')
  async enter(@Ctx() context: Context) {
    const devices = await this.deviceRepository.findOnlineDevices();

    const formatMessage = (device: Device) =>
      device.name + ': ' + device.lastOnline.toLocaleString();

    context.reply(
      'Last online time of devices: \n' + devices.map(formatMessage).join('\n')
    );
  }

  onModuleInit(): void {
    this.logger.log('[TgBotController] initialized');
  }
}
