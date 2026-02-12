import { Test, TestingModule } from '@nestjs/testing';
import { NinjavanService } from './ninjavan.service';

describe('NinjavanService', () => {
  let service: NinjavanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NinjavanService],
    }).compile();

    service = module.get<NinjavanService>(NinjavanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
