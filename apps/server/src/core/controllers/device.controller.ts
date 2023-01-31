import {Controller, Get, Inject} from '@nestjs/common';
import DeviceRepository from '../repositories/device.repository';
@Controller('api/devices')
export class DeviceController {
  constructor(
    @Inject(DeviceRepository)
    private readonly deviceRepository: DeviceRepository
  ) {}

  @Get('')
  async getDevices() {
    return await this.deviceRepository.findAll();
  }
  @Get('online')
  async getOnlineDevices() {
    return await this.deviceRepository.findOnlineDevices();
  }
}
