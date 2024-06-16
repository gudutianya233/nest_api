import { Test, TestingModule } from '@nestjs/testing';
import { SwiperImageController } from './swiperImage.controller';

describe('SwiperImageController', () => {
  let controller: SwiperImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwiperImageController],
    }).compile();

    controller = module.get<SwiperImageController>(SwiperImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
