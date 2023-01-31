import {DeviceMessage} from '../interfaces';
import DeviceRepository from '../repositories/device.repository';
import {Device} from '@prisma/client';
import {Inject, Injectable} from '@nestjs/common';
import {LoggerService} from '../logger/logger.service';

@Injectable()
export default class HandleDeviceMessageInteractor {
  constructor(
    @Inject(DeviceRepository) private deviceRepository: DeviceRepository,
    @Inject(LoggerService) private logger: LoggerService
  ) {}

  async execute(message: DeviceMessage): Promise<Device> {
    this.logger.log('[CoreModule] HandleDeviceMessageInteractor execute', {
      'this.deviceRepository': !!this.deviceRepository,
    });
    // parse the incoming UDP message to extract the device ID and other information
    const {deviceId, deviceType} = message;
    const deviceData: Device = {
      id: deviceId,
      name: deviceType,
      type: deviceType,
      lastOnline: new Date(parseInt(message.timestamp) * 1000),
    };

    // use the device repository to find or create the device
    const device: Device | null = await this.deviceRepository.findOne(deviceId);
    if (!device) {
      this.logger.info(
        '[CoreModule] Device not found, creating new device',
        deviceData
      );
      return this.deviceRepository.create(deviceData);
    } else {
      // update the device with the latest information
      return this.deviceRepository.update(deviceId, deviceData);
    }
  }
}
