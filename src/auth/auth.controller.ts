import { Controller,Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/middleware/JwtGuard';
@ApiTags('微信网页授权')
@Controller('auth')
export class AuthController {
  @Public()
  @ApiOperation({summary:'获取用户授权'})
  @Get('getUserAuthorize')
  getWechatAuthUrl(@Query('redirect_uri') redirectUri: string) {
    const appid =  process.env.APP_ID;
    const scope = 'snsapi_userinfo';
    const state = 'STATE';
    const url:string = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
    return { url };
  }
}
         