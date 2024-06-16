import { Test, TestingModule } from '@nestjs/testing';
import { WechatApiService } from './wechat.service';

describe('WechatApiService', () => {
  let service: WechatApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WechatApiService],
    }).compile();

    service = module.get<WechatApiService>(WechatApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
