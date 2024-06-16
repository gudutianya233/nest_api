import { Controller, Post, Body, Get,Headers, Query, Res, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from 'src/middleware/JwtGuard';
@ApiTags('用户相关操作')
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  ///运维系统
  @ApiOperation({ summary: '搜索匹配用户名字的用户评价' })
  @Post('searchUserEvaluate')
  async searchUserEvaluate(@Body() body: any) {
    const { name, page, pageSize } = body;
    return await this.usersService.searchUserEvaluate(name, page, pageSize);
  }

  @ApiOperation({ summary: '修改选中的评价的状态' })
  @Post('changeUserEvaluateStatus')
  async changeUserEvaluateStatus(@Body() body: any) {
    const { id, status } = body
    return await this.usersService.changeUserEvaluateStatus(id, status);
  }
  @ApiOperation({ summary: '删除选中的评价' })
  @Post('removeUserEvaluate')
  async removeUserEvaluate(@Body() body: any) {
    const { id } = body
    return await this.usersService.removeUserEvaluate(id);
  }
  @ApiOperation({ summary: '运维系统保存评价' })
  @Post('saveUserEvaluate')
  async saveUserEvaluate(@Body() body: any) {
    const userEvaluate = body.userEvaluate
    const doctorId = body.userEvaluate.doctorId
    return await this.usersService.saveUserEvaluate(userEvaluate, doctorId);
  }
  @ApiOperation({ summary: '修改选中的评价信息' })
  @Post('changeUserEvaluate')
  async changeUserEvaluate(@Body() body: any) {
    const userEvaluate = body.userEvaluate
    return await this.usersService.changeUserEvaluate(userEvaluate);
  }


  @ApiOperation({ summary: '搜索匹配名字的就诊卡' })
  @Post('searchPatientsCard')
  async searchPatientsCard(@Body() body: any) {
    const { name, page, pageSize } = body;
    return await this.usersService.searchPatientsCard(name, page, pageSize);
  }
  @ApiOperation({ summary: '删除选中的就诊卡' })
  @Post('removePatientsCard')
  async removePatientsCard(@Body() body: any) {
    const { id } = body
    return await this.usersService.removePatientsCard(id);
  }
  @ApiOperation({ summary: '添加就诊卡时,搜索用户的名字查询到需要绑定的用户' })
  @Post('searchPatientsCardUser')
  async searchPatientsCardUser(@Body() body: any) {
    const { nickname,page,pageSize } = body;
    return await this.usersService.searchPatientsCardUser(nickname,page,pageSize);
  }
  @ApiOperation({ summary: '保存添加的就诊卡' })
  @Post('savePatientsCard')
  async savePatientsCard(@Body() body: any) {
    const patientsCard = body.patientsCard
    const userId = body.patientsCard.userId
    return await this.usersService.savePatientsCard(patientsCard, userId);
  }

  @ApiOperation({ summary: '修改选中的就诊卡' })
  @Post('changePatientsCard')
  async changePatientsCard(@Body() body: any) {
    const patientsCard = body.patientsCard 
    return await this.usersService.changePatientsCard(patientsCard);
  }
  @ApiOperation({ summary: '搜索匹配微信名称的用户' })
  @Post('searchUser')
  async searchUser(@Body() body: any) {
    const { name, page, pageSize } = body;
    return await this.usersService.searchUser(name, page, pageSize);
  }
  @ApiOperation({ summary: '修改选中的用户信息' })
  @Post('changeUser')
  async changeUser(@Body() body: any) {
    const user = body.user
    return await this.usersService.changeUser(user);
  }
  @ApiOperation({ summary: '搜索匹配用户名字的关注信息' })
  @Post('searchUserFollow')
  async searchUserFollow(@Body() body: any) {
    const { name, page, pageSize } = body;
    return await this.usersService.searchUserFollow(name, page, pageSize);
  }
  @ApiOperation({ summary: '修改选中的用户关注信息' })
  @Post('changeUserFollow')
  async changeUserFollow(@Body() body: any) {
    const userFollow = body.userFollow
    return await this.usersService.changeUserFollow(userFollow);
  }
  @ApiOperation({ summary: '删除选中的关注信息' })
  @Post('removeUserFollow')
  async removeUserFollow(@Body() body: any) {
    const { id } = body
    return await this.usersService.removeUserFollow(id);
  }
  @ApiOperation({ summary: '搜索匹配用户名字/电话的未退款的订单(订单状态为0，1，2，3)' })
  @Post('searchUserRegister')
  async searchUserRegister(@Body() body: any) {
    const { search, page, pageSize } = body;
    return await this.usersService.searchUserRegister(search, page, pageSize);
  }
  @ApiOperation({ summary: '退款页面获取退款相关的订单(订单状态为4，5，6)，匹配就诊人名字/电话' })
  @Post('searchRefundUserRegister')
  async searchRefundUserRegister(@Body() body: any) {
    const { search, page, pageSize } = body;
    return await this.usersService.searchRefundUserRegister(search, page, pageSize);
  }
  @ApiOperation({ summary: '搜索匹配名字的运维账号' })
  @Post('searchAccount')
  async searchAccount(@Body() body: any) {
    const { name, page, pageSize } = body;
    return await this.usersService.searchAccount(name, page, pageSize);
  }

  @ApiOperation({ summary: '添加运维账号(管理员账号才有这个权限)' })
  @Post('saveAccount')
  async saveAccount(@Body() body: any) {
    const systemUser=body.systemUser
    const operator=body.systemUser.operator
    return await this.usersService.saveAccount(systemUser,operator);
  }
  @ApiOperation({ summary: '删除选中的运维账号' })
  @Post('removeAccount')
  async removeAccount(@Body() body: any) {
    const { id } = body
    return await this.usersService.removeAccount(id);
  }
  @ApiOperation({ summary: '修改账号的信息' })
  @Post('changeAccount')
  async changeAccount(@Body() body: any) {
    const systemUser=body.systemUser
    if(systemUser.roles==1){
      return await this.usersService.changeAccount(systemUser);
    }
    return {code:401,message:'没有权限'}
  }
  

  @Public()
  @ApiOperation({ summary: '从微信服务器拉取用户信息' })
  @Post('signin')
  async signIn(@Body() body: any) {
    const { code } = body.params;
    // console.log(code)
    // 使用code换取access_token和openid
    const { access_token, openid } = await this.usersService.getAccessToken(code);
    // 使用access_token和openid获取用户信息
    const userOpenId = await this.usersService.getUserInfo(access_token, openid);
    // 返回用户信息的openid
    return userOpenId;
  }


  @ApiOperation({ summary: '从数据库获取用户信息' })
  @Post('getUserInformation')
  async getUserInformation(@Body() body: any) {
    const { openid } = body;
    return await this.usersService.getUserInformation(openid);
  }

  @ApiOperation({ summary: '获取用户信息里的所有启用的功能' })
  @Get('getCommonFunction')
  async getCommonFunction() { 
    return await this.usersService.getCommonFunction();
  }

  @ApiOperation({ summary: '根据openid获取用户用户ID然后根据userId,doctorId查询是否关注此医生' })
  @Post('getUserId')
  async getUserId(@Body() body: any) {
    const { openId } = body;
    return await this.usersService.getUserId(openId);
  }


  @ApiOperation({ summary: '获取用户是否关注了当前医生' })
  @Post('checkIfUserFollowsDoctor')
  async checkIfUserFollowsDoctor(@Body() body: any) {
    const { userId, doctorId } = body;
    return await this.usersService.checkIfUserFollowsDoctor(userId, doctorId);
  }


  @ApiOperation({ summary: '获取用户关注的医生数量' })
  @Post('getUserFollowCount')
  async getUserFollowCount(@Body() body: any) {
    const { userId } = body;
    return await this.usersService.getUserFollowCount(userId);
  }

  @ApiOperation({ summary: '获取用户关注的医生信息' })
  @Post('getUserFollowInfo')
  async getUserFollowInfo(@Body() body: any) {
    const { userId } = body;
    return await this.usersService.getUserFollowInfo(userId);
  }

  @ApiOperation({ summary: '当前用户关注当前医生' })
  @Post('userFollowDoctor')
  async userFollowDoctor(@Body() body: any) {
    const { doctorId, openId, userId } = body;
    return await this.usersService.userFollowDoctor(userId, doctorId, openId);
  }

  @ApiOperation({ summary: '当前用户取消关注当前医生' })
  @Post('userCancellationFollowDoctor')
  async userCancellationFollowDoctor(@Body() body: any) {
    const { userId, doctorId } = body;
    return await this.usersService.userCancellationFollowDoctor(userId, doctorId);
  }

  @ApiOperation({ summary: '获取当前医生5条通过的评价' })
  @Post('getUserEvaluateWeChat')
  async getUserEvaluateWeChat(@Body() body: any) {
    //跳过的记录数
    const { skip, take, doctorId } = body;
    return await this.usersService.getUserEvaluateWeChat(skip, take, doctorId);
  }
  @ApiOperation({ summary: '获取当前医生通过的评价条数' })
  @Post('getUserEvaluateWeChatCount')
  async getUserEvaluateWeChatCount(@Body() body: any) {
    //跳过的记录数
    const { doctorId } = body;
    return await this.usersService.getUserEvaluateWeChatCount(doctorId);
  }

  @ApiOperation({ summary: '获取当前用户的所有就诊卡' })
  @Post('getUserPatientsCardWeChat')
  async getUserPatientsCardWeChat(@Body() body: any) {
    //跳过的记录数
    const { userId } = body;
    return await this.usersService.getUserPatientsCardWeChat(userId);
  }

  
  @ApiOperation({ summary: '获得当前用户的挂号情况' })
  @Post('getUserRegister')
  async getUserRegister(@Body() body: any) {
    const {userId}=body
    return await this.usersService.getUserRegister(userId);
  }
  @ApiOperation({ summary: '用户在挂号页面提交订单,创建预付单,拉起微信jsapi支付' })
  @Post('userRegisterPlaceOrder')
  async userRegisterPlaceOrder(@Body() body: any) { 
    const userRegister=body.userRegister
    const doctorId=body.userRegister.doctor.id
    const patientId=body.userRegister.patient.id
    const userId=body.userRegister.user.id
    return await this.usersService.userRegisterPlaceOrder(userRegister,doctorId,patientId,userId);
  }
  @ApiOperation({ summary: '用户在我的订单页面,点击支付,拉起微信jsapi支付' })
  @Post('reservationPlaceOrder')
  async reservationPlaceOrder(@Body() body: any) { 
    const userRegister=body.userRegister
    return await this.usersService.reservationPlaceOrder(userRegister);
  }
  @ApiOperation({ summary: '对前端的调用js-sdk签名进行sha1签名,配置wx.config的签名' })
  @Post('getSignature')
  async getSignature(@Body() body: any) {
    const params=body.params
    return await this.usersService.getSignature(params); 
  }
  @ApiOperation({ summary: '对前端的调用wx.chooseWXPay签名进行rsa签名' })
  @Post('getPaySign')
  async getPaySign(@Body() body: any) {
    const params=body.params
    return await this.usersService.getPaySign(params);
  }
  
  @Public()
  @ApiOperation({ summary: '用户在前端使用微信的js-sdk支付后。微信服务器定时发起订单的支付通知' })
  @Post('userWeChatPaymentNotification')
  async userWeChatPaymentNotification(@Headers() header: any,@Body() body: any,@Res() res: Response) {
    const   headers  = header;
    const   data  = body;
    const result = await this.usersService.userWeChatPaymentNotification(headers,data);
    if(result){
      if (result.code === 'SUCCESS') {
        // 如果为SUCCESS，表示支付成功，返回result
        res.status(200).send(result);
        return res 
            }
            else{
               // 如果不为SUCCESS，表示支付失败，使用HttpCode装饰器，并传入400作为参数，表示失败时返回400状态码
               res.status(400).send(result);
               return res
            }
    } 
  }

  @ApiOperation({ summary: '用户申请退款,向微信发起退款请求' })
  @Post('userWeChatRefund')
  async userWeChatRefund(@Body() body: any) {
    const userRegister=body.userRegister
    return await this.usersService.userWeChatRefund(userRegister);
  }
  @ApiOperation({ summary: '退款消息通知的回调接口' })
  @Post('userWeChatRefundNotification')
  async userWeChatRefundNotification(@Headers() header: any,@Body() body: any,@Res() res: Response) {
    const   headers  = header;
    const   data  = body;
    const result= await this.usersService.userWeChatRefundNotification(headers,data);
    if(result){
      if (result.code === 'SUCCESS') {
        // 如果为SUCCESS，表示支付成功，返回result
        res.status(200).send(result);
        return res 
            }
            else{
               // 如果不为SUCCESS，表示支付失败，使用HttpCode装饰器，并传入400作为参数，表示失败时返回400状态码
               res.status(400).send(result);
               return res
            }
    } 
  }
  @ApiOperation({ summary: '待支付的订单，点击取消' })
  @Post('userWeChatCancel')
  async userWeChatCancel(@Body() body: any) {
    const userRegister=body.userRegister
    return await this.usersService.userWeChatCancel(userRegister);
  }

  @ApiOperation({ summary: '用户查询所有已完成的订单' })
  @Post('getEvaluate')
  async getEvaluate(@Body() body: any) {
    const openid=body.openid
    return await this.usersService.getEvaluate(openid);
  }
  
  @ApiOperation({ summary: '微信端用户评价已完成的订单' })
  @Post('saveUserEvaluateRegister')
  async saveUserEvaluateRegister(@Body() body: any) {
    const userEvaluate = body.userEvaluate
    const doctorId = body.userEvaluate.doctorId
    const SystemNumber = body.userEvaluate.SystemNumber
    return await this.usersService.saveUserEvaluateRegister(userEvaluate, doctorId,SystemNumber);
  }
  @ApiOperation({ summary: '微信端用户查看评价' })
  @Post('seeUserEvaluate')
  async seeUserEvaluate(@Body() body: any) {
    const SystemNumber = body.SystemNumber
    return await this.usersService.seeUserEvaluate(SystemNumber);
  }
  @ApiOperation({ summary: '微信端用户修改评价' })
  @Post('changeEvaluate')
  async changeEvaluate(@Body() body: any) {
    const userEvaluate = body.userEvaluate
    return await this.usersService.changeEvaluate(userEvaluate);
  }
  

}
