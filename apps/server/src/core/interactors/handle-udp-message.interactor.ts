import {Inject, Injectable} from '@nestjs/common';
import DeviceRepository from '../repositories/device.repository';
import {UdpService} from '../../services/udp/udp.service';
import {LoggerService} from '../logger/logger.service';
import HandleDeviceMessageInteractor from './handle-device-message.interactor';
import {RemoteInfo} from 'dgram';

@Injectable()
export default class HandleUdpMessageInteractor {
  constructor(
    @Inject(DeviceRepository) private deviceRepository: DeviceRepository,
    @Inject(UdpService) private udpService: UdpService,
    @Inject(LoggerService) private logger: LoggerService,
    @Inject(HandleDeviceMessageInteractor)
    private handleDeviceMessageInteractor: HandleDeviceMessageInteractor
  ) {}

  execute() {
    this.logger.log('[CoreModule] HandleUdpMessageInteractor execute', {
      'this.deviceRepository': !!this.deviceRepository,
    });
    this.udpService.addListener(this.deviceMessageListener);
    this.udpService.addListener(this.pingPongListener);
  }

  deviceMessageListener: (msg: Buffer) => void = (msg: Buffer) => {
    const message = msg.toString();
    if (!message.startsWith('{')) return;
    this.handleDeviceMessageInteractor.execute(JSON.parse(message));
  };

  pingPongListener: (msg: Buffer, rinfo: RemoteInfo) => void = (
    msg: Buffer,
    rinfo: RemoteInfo
  ) => {
    if (!msg.toString().includes('ping-power')) return;
    this.logger.log(
      '[CoreModule] HandleUdpMessageInteractor pingPongListener',
      {rinfo, ip: this.udpService.ipAddress}
    );
    this.udpService.send(
      `pong-power:${this.udpService.ipAddress}`,
      rinfo.port,
      rinfo.address
    );
  };
}
