import { Controller, Post, Body, Get, Headers, Query, Res, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/middleware/JwtGuard';
import { MailService } from './mail.service';
@ApiTags('用户相关操作')
@Controller('mail')
export class MailController {
    constructor(
        private readonly mailService: MailService
        
        ) { }
    @Public()
    @ApiOperation({ summary: '挂号内容发送邮件' })
    @Post('sendMail')
    async sendMail(@Body() body: any) {
        // 从body中获取请求数据
        const { from, name, phone, sex, doctor, age, mss } = body;
        if (from && name && phone && sex && doctor && age && mss) {
        // 调用mailService的sendMail方法
        return await this.mailService.sendMail(from, name, phone, sex, doctor, age, mss);
        } else {
        // 如果没有，返回403，表示请求参数不合法
        return { coed: 403, message: '请求参数不合法' };
        }
    }

    @Public()
    @ApiOperation({ summary: '投诉内容发送邮件' })
    @Post('complaintMail')
    async complaintMail(@Body() body: any) {
        const from = body.from;
        if (from.title && from.content && from.phone) {
          // 调用mailService的complaintMail方法
          return await this.mailService.complaintMail(from);
        } else {
          // 如果没有，返回403，表示请求参数不合法
          return { coed: 403, message: '请求参数不合法' };
        }
      }
    
}