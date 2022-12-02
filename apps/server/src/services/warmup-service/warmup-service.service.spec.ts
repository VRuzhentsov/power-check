import { Test, TestingModule } from '@nestjs/testing';
import { WarmupServiceService } from './warmup-service.service';

describe('WarmupServiceService', () => {
  let service: WarmupServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarmupServiceService],
    }).compile();

    service = module.get<WarmupServiceService>(WarmupServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
