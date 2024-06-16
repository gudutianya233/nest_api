import { Test, TestingModule } from '@nestjs/testing';
import { SwiperImageService } from './swiperImage.service';

describe('SwiperImageService', () => {
  let service: SwiperImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwiperImageService],
    }).compile();

    service = module.get<SwiperImageService>(SwiperImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
