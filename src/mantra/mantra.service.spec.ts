import { Test, TestingModule } from '@nestjs/testing';
import { MantraService } from './mantra.service';

describe('MantraService', () => {
  let service: MantraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MantraService],
    }).compile();

    service = module.get<MantraService>(MantraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
