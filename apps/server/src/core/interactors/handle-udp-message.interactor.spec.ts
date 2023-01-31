import {Test, TestingModule} from '@nestjs/testing';
import {LoggerService} from '../logger/logger.service';
import HandleUdpMessageInteractor from './handle-udp-message.interactor';
import {UdpService} from '../../services/udp/udp.service';
import DeviceRepository from '../repositories/device.repository';
import {DeviceMessage} from '../interfaces';
import HandleDeviceMessageInteractor from './handle-device-message.interactor';

describe('HandleUdpMessageInteractor', () => {
  let interactor: HandleUdpMessageInteractor;
  let logger: LoggerService;
  let udpService: UdpService;
  let deviceRepository: DeviceRepository;
  let handleDeviceMessageInteractor: HandleDeviceMessageInteractor;
  const deviceMessage: DeviceMessage = {
    deviceId: 'testDeviceId',
    deviceType: 'testDeviceType',
    timestamp: '1234567890',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleUdpMessageInteractor,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
          },
        },
        UdpService,
        {
          provide: DeviceRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: HandleDeviceMessageInteractor,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    interactor = module.get<HandleUdpMessageInteractor>(
      HandleUdpMessageInteractor
    );
    logger = module.get<LoggerService>(LoggerService);
    udpService = module.get<UdpService>(UdpService);
    deviceRepository = module.get<DeviceRepository>(DeviceRepository);
    handleDeviceMessageInteractor = module.get<HandleDeviceMessageInteractor>(
      HandleDeviceMessageInteractor
    );
  });

  afterAll(() => {
    udpService.close();
  });

  it('should listen to udp messages and execute HandleDeviceMessageInteractor', () => {
    const spyOnHandleDeviceMessageInteractor = jest.spyOn(
      handleDeviceMessageInteractor,
      'execute'
    );
    const spyOnUdpService = jest.spyOn(udpService, 'addListener');

    interactor.execute();

    udpService.emit(
      'message',
      Buffer.from(JSON.stringify(deviceMessage), 'utf8')
    );

    expect(spyOnHandleDeviceMessageInteractor).toHaveBeenCalledWith(
      deviceMessage
    );
    expect(spyOnUdpService).toHaveBeenCalledTimes(1);
  });
});
