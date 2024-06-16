import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import{WechatApiService} from './wechat.service'


@ApiTags('微信服务器接口')
@Controller('wechat_api')
export class WechatApiController {
    constructor(private readonly wechatService: WechatApiService) {}

@Get()
@ApiOperation({summary:'验证服务器'})
verifyWechatServer(
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,):string{
if (this.wechatService.verifySignature(signature, timestamp, nonce)) {
    return echostr;
  } else {
    return 'Verification failed';
  }
}

//GetAccessToken
@Get('GetAccessToken')
async getAccessToken(): Promise<void> {
  await this.wechatService.getAccessToken();
}

//getStableAccessToken
@Get('GetStableAccessToken') 
async getStableAccessToken(){
 const token= await this.wechatService.getStableAccessToken();
  return token;
}

//获得微信的jsApi支付的参数jsapi_ticket
@Get('getWechatPayParamJsapi_ticket')
async getWechatPayParams(){
 const japi_ticket= await this.wechatService.getWechatPayParamJsapi_ticket();
  return japi_ticket;
}

}
