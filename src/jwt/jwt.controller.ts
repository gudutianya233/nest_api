import { Body, Controller, Headers, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from './jwt.service';
import { Public } from 'src/middleware/JwtGuard';
@Controller('jwt')
@ApiTags('JWT接口')
export class JwtController {
    constructor(
        private readonly jwtService: JwtService,
        ) {}
    @Public()
  @ApiOperation({ summary: '运维系统登录接口' })
  @Post('login')
  async login(@Body() body){
   const  {account,password}=body
   //验证用户名和密码
   const usersvalid=await this.jwtService.validateUser(account,password)
    //密码正确
    if(usersvalid.code==200){
    // 定义一个payloads对象，包含用户账号,id,名称
    const payloads = {
        account: account,
        id:usersvalid.user.id,
        name:usersvalid.user.name
    };
    // 调用JwtService的signToken方法，生成令牌，设置为1小时后过期
    const token = await this.jwtService.signToken(payloads, 60 * 60);
    const payload = JSON.stringify(payloads);
    return {code:200,token,payload}
    }
    return {code:402,message:usersvalid.message}
  }
  @Public()
  @ApiOperation({ summary: '微信端登录接口' })
  @Post('loginWeChat')
  async loginWeChat(@Body() body){
   const  {openid}=body
   if(openid){
    // 定义一个payload对象，包含用户openid
    const payload = {
        openid: openid,
    };
    // 调用JwtService的signToken方法，生成令牌，设置为2小时后过期
    const token = await this.jwtService.signToken(payload, 3*60 * 60);
    return {code:200,token}
   } 
return{code:402,message:'没有openid'}
  }
  
  @ApiOperation({ summary: '刷新令牌接口' })
  @Post('refresh')
  async refresh(@Body() body:any){
    const {refreshToken} = body   
    // 验证旧的令牌 
    if(refreshToken){
        const payload = await this.jwtService.verifyToken(refreshToken);  
        if (!payload) {
          return {code:402,message:'无效的令牌或者令牌已经过期'} 
         // throw new UnauthorizedException('无效的令牌或者令牌已经过期'); 
        }
        // 生成新的令牌 
        const token = await this.jwtService.signToken(payload, 60 * 60);  
        return {code:200,token};
    }   
    return {code:403,message:'body中没有携带令牌'}
  }  
}     