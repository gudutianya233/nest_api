import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintMail } from './entities/complaintMail.entity';
@Module({
  imports: [    
    MailerModule.forRoot({  transport: {
    host: 'smtp.qq.com',
    port: 587,//smtp服务器的端口
    ignoreTLS: true,
    secure: false,
    auth: {
      user: '',//发送邮件的smtp的邮箱
      pass: '',//发送邮件的smtp的邮箱的授权码
    },
  },
  defaults: {
    from: '',//发送邮件的smtp的邮箱
  },
  preview: false,
  template: {
    dir: process.cwd() + '/template/',
    adapter: new PugAdapter(), // or new PugAdapter() or new EjsAdapter()
    options: {
      strict: true,
    },
  },}),
  TypeOrmModule.forFeature([ComplaintMail])
], 
  providers: [MailService], // 注册MailService为提供者
  controllers: [MailController], // 注册MailController为控制器
  exports: [MailService], // 导出MailService，以便其他模块可以使用
})
export class MailModule {}
