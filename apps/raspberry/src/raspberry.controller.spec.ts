import {Test, TestingModule} from '@nestjs/testing';
import {RaspberryController} from './raspberry.controller.js';
import {RaspberryService} from './raspberry.service.js';

describe('RaspberryController', () => {
  let raspberryController: RaspberryController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RaspberryController],
      providers: [RaspberryService],
    }).compile();

    raspberryController = app.get<RaspberryController>(RaspberryController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(raspberryController.getHello()).toBe('Hello World!');
    });
  });
});
