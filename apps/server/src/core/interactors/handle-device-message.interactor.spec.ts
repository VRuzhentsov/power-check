import {Test, TestingModule} from '@nestjs/testing';
import DeviceRepository from '../repositories/device.repository';
import HandleDeviceMessageInteractor from './handle-device-message.interactor';
import {LoggerService} from '../logger/logger.service';
import {DeviceMessage} from '../interfaces';
import {PrismaService} from '../../services/prisma/prisma.service';
import {prismaMock} from '../../../test/mock/singleton-prisma';
import DeviceTypes from '../../../../../shared/constants/DeviceTypes';
import {Device} from '@prisma/client';

describe('HandleDeviceMessageInteractor', () => {
  let interactor: HandleDeviceMessageInteractor;
  let deviceRepository: DeviceRepository;
  let logger: LoggerService;

  const deviceId = 'c6a5140b-48d1-48b6-937c-d8db447b8142';
  const deviceType = DeviceTypes.ESP8266;
  const deviceMessage = {
    deviceId,
    deviceType,
    timestamp: new Date().getTime().toString(),
  };
  const defaultDevice: Device = {
    id: deviceId,
    name: deviceType,
    type: deviceType,
    lastOnline: new Date(parseInt(deviceMessage.timestamp) * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleDeviceMessageInteractor,
        {
          provide: DeviceRepository,
          useValue: {
            findOne:
              prismaMock.device.findUnique.mockResolvedValue(defaultDevice),
            create: prismaMock.device.create.mockResolvedValue(defaultDevice),
            update:
              prismaMock.device.findUnique.mockResolvedValue(defaultDevice),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            info: jest.fn(),
          },
        },
        PrismaService,
      ],
    }).compile();

    interactor = module.get<HandleDeviceMessageInteractor>(
      HandleDeviceMessageInteractor
    );
    deviceRepository = module.get<DeviceRepository>(DeviceRepository);
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should create a new device when it does not exist', async () => {
    const message: DeviceMessage = {
      deviceId: 'new-device-id',
      deviceType: DeviceTypes.ESP8266,
      timestamp: '1614973719',
    };

    jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(deviceRepository, 'create').mockResolvedValue({
      id: 'new-device-id',
      name: DeviceTypes.ESP8266,
      type: DeviceTypes.ESP8266,
      lastOnline: new Date(1614973719000),
    });

    const result = await interactor.execute(message);

    expect(deviceRepository.findOne).toHaveBeenCalledWith('new-device-id');
    expect(deviceRepository.create).toHaveBeenCalledWith({
      id: 'new-device-id',
      name: DeviceTypes.ESP8266,
      type: DeviceTypes.ESP8266,
      lastOnline: new Date(1614973719000),
    });
    expect(result).toEqual({
      id: 'new-device-id',
      name: DeviceTypes.ESP8266,
      type: DeviceTypes.ESP8266,
      lastOnline: new Date(1614973719000),
    });
  });

  it('should update an existing device', async () => {
    await interactor.execute(deviceMessage);
    expect(deviceRepository.update).toHaveBeenCalledWith(
      deviceId,
      defaultDevice
    );
    expect(deviceRepository.create).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });
});
