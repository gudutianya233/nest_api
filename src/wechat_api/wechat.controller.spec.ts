import { Test, TestingModule } from '@nestjs/testing';
import { WechatApiController } from './wechat.controller';

describe('WechatApiController', () => {
  let controller: WechatApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WechatApiController],
    }).compile();

    controller = module.get<WechatApiController>(WechatApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
