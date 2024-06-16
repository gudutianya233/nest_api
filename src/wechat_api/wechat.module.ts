import { Module } from '@nestjs/common';
import {  WechatApiService } from './wechat.service';
import {  WechatApiController } from './wechat.controller';
import { WeChatAccessToken } from './entities/WeChatAccessToken.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JsapiTicket } from './entities/Jsapi_ticket.entity';
import { WechatCertificate } from './entities/Wechat_Certificate.entity';
@Module({
  imports:[TypeOrmModule.forFeature([WeChatAccessToken,JsapiTicket,WechatCertificate]),
  HttpModule,],
  controllers: [WechatApiController],
  providers: [WechatApiService],
  exports:[WechatApiService]
})
export class WeChatModule {}
