import {Device} from '@prisma/client';
import {PrismaService} from '../../services/prisma/prisma.service';
import {Inject} from '@nestjs/common';

export default class DeviceRepository {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}
  findOne(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: {
        id,
      },
    });
  }

  findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  async findOnlineDevices(): Promise<Device[]> {
    return this.prisma.device.findMany({
      where: {
        lastOnline: {
          gte: new Date(Date.now() - 60000),
        },
      },
    });
  }

  create(data: Device): Promise<Device> {
    return this.prisma.device.create({
      data,
    });
  }

  update(id: string, data: Device): Promise<Device> {
    return this.prisma.device.update({
      where: {
        id,
      },
      data,
    });
  }
}
