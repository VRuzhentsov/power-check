import {Inject, Module} from '@nestjs/common';
import {ConfigService} from '../config/config.service';
import {LoggerService} from './logger/logger.service';
import {UdpService} from '../udp/udp.service';

@Module({
  providers: [ConfigService, LoggerService, UdpService],
  exports: [ConfigService, LoggerService, UdpService],
})
export class CoreModule {
  constructor(
    @Inject(UdpService) private readonly udpService: UdpService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.logger.log('[CoreModule] created');

    this.udpService.addListener((msg: String, rinfo: Object) => {
      this.logger.log('[CoreModule] udpService message', {msg, rinfo});
    });
  }
}
