import {Inject, Module, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '../config/config.service';
import {LoggerService} from './logger/logger.service';
import {UdpService} from '../services/udp/udp.service';
import {DeviceMessage} from './interfaces';
import {DeviceController} from './controllers/device.controller';
import {Device} from '@prisma/client';
import DeviceRepository from './repositories/device.repository';
import {PrismaService} from '../services/prisma/prisma.service';
import HandleDeviceMessageInteractor from './interactors/handle-device-message.interactor';
import HandleUdpMessageInteractor from './interactors/handle-udp-message.interactor';

@Module({
  controllers: [DeviceController],
  providers: [
    // services
    ConfigService,
    LoggerService,
    UdpService,
    PrismaService,
    // repositories
    DeviceRepository,
    // interactors
    HandleUdpMessageInteractor,
    HandleDeviceMessageInteractor,
  ],
  exports: [
    // services
    ConfigService,
    LoggerService,
    UdpService,
    PrismaService,
    // repositories
    DeviceRepository,
    // interactors
    HandleUdpMessageInteractor,
    HandleDeviceMessageInteractor,
  ],
})
export class CoreModule implements OnModuleInit {
  constructor(
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(HandleUdpMessageInteractor)
    private readonly handleUdpMessageInteractor: HandleUdpMessageInteractor
  ) {
    this.logger.log('[CoreModule] created');
  }

  onModuleInit() {
    this.logger.log('[CoreModule] initialized');
    this.handleUdpMessageInteractor.execute();
  }
}
