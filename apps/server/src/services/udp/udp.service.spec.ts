import {UdpService} from './udp.service';
import {LoggerService} from '../../core/logger/logger.service';
import {RemoteInfo} from 'dgram';

jest.mock('../../core/logger/logger.service');

describe('UdpService', () => {
  let udpService: UdpService;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    logger = new LoggerService() as jest.Mocked<LoggerService>;
    udpService = new UdpService(logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
    udpService.close();
  });

  describe('addListener', () => {
    it('should add a listener to the listeners array', () => {
      const listener = jest.fn();
      udpService.addListener(listener);

      expect(udpService['_listeners']).toContain(listener);
    });
  });

  describe('removeListener', () => {
    it('should remove a listener from the listeners array', () => {
      const listener = jest.fn();
      udpService.addListener(listener);
      udpService.removeListener(listener);

      expect(udpService['_listeners']).not.toContain(listener);
    });
  });

  describe('listen', () => {
    it('should bind the socket to the specified port and attach a message event listener', () => {
      const spy = jest.spyOn(udpService['socket'], 'bind');
      const spyOn = jest.spyOn(udpService['socket'], 'on');

      udpService.listen();

      expect(spy).toHaveBeenCalledWith(41235);
      expect(spyOn).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should call the listeners when a message event is received', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const message = 'test message';
      const rinfo: RemoteInfo = {
        address: '127.0.0.1',
        port: 1234,
        family: 'IPv4',
        size: 11,
      };

      udpService.addListener(listener1);
      udpService.addListener(listener2);
      udpService.listen();

      const eventListeners = udpService['socket'].listeners('message');
      eventListeners.forEach(listener => listener(message, rinfo));

      expect(listener1).toHaveBeenCalledWith(message, rinfo);
      expect(listener2).toHaveBeenCalledWith(message, rinfo);
    });
  });

  describe('close', () => {
    it('should close the socket and log a message', () => {
      const spy = jest.spyOn(udpService['socket'], 'close');

      udpService.close();

      expect(spy).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('[UdpService] closing');
    });
  });
});
