import { Test, TestingModule } from '@nestjs/testing';
import { UdpService } from './udp.service';

describe('UdpService', () => {
  let service: UdpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UdpService],
    }).compile();

    service = module.get<UdpService>(UdpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
