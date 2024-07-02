import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintMail } from './entities/complaintMail.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { UserRegister } from 'src/users/entities/user_register.entity';


@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        //投诉表
        @InjectRepository(ComplaintMail)
        private readonly complaintMailRepository: Repository<ComplaintMail>,
    ) { }


 // 发送挂号内容邮件
 async sendMail(from: string, name: string, phone: string, sex: string, doctor: string, age: string, mss: string): Promise<any> {
    // 构造邮件主题
    const subject = `【${name}】的预约信息-来自${from}`;
    // 构造邮件正文
    const text = `来自${from}\n姓名：${name}\n电话：${phone}\n性别：${sex}\n年龄：${age}\n医生：${doctor}\n病请描述：${mss}`;
    // 构造邮件HTML格式
    const html = `<p>姓名：${name}</p><p>电话：${phone}</p><p>性别：${sex}</p><p>年龄：${age}</p><p>医生：${doctor}</p><p>病请描述：${mss}</p>`;
    // 调用sendMail方法
    return await this.mailerService
      .sendMail({
        to: '', //接受邮件的邮箱
        from: '', //发送邮件的smtp的邮箱
        subject: subject,
        text: text,
        html: html,
      })
      .then((result) => {
        // 发送成功，返回一个对象
        console.log(result);
        return { status: 200, message: '发送成功' };
      })
      .catch((error) => {
        // 发送失败，返回错误信息
        return error;
      });
  }


 // 发送投诉内容邮件
 async complaintMail(from: any): Promise<any> {
    const date = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
    });
    // 保存信息到数据库中
    await this.saveComplaintMail(from);
    // 构造邮件主题
    const subject = `投诉标题:${from.title}-投诉时间:${date}-`;
    // 构造邮件正文
    const text = `投诉标题${from.title}\n投诉内容：${from.content}\n联系电话：${from.phone}`;
    // 构造邮件HTML格式
    const html = `<p>标题：${from.title}</p><p>内容：${from.content}</p><p>电话：${from.phone}</p>`;
    // 调用sendMail方法
    return await this.mailerService
      .sendMail({
        to: ['', ''], //接受邮件的邮箱
        from: '', //发送邮件的smtp的邮箱
        subject: subject,
        text: text,
        html: html,
      })
      .then((result) => {
        // 发送成功，返回一个对象
        console.log(result);
        return { status: 200, message: '发送成功' };
      })
      .catch((error) => {
        // 发送失败，返回错误信息
        return error;
      });
    }

    //保存投诉内容(御生堂)
    async saveComplaintMail(from:ComplaintMail){
        const  complaintMail=new ComplaintMail
        complaintMail.content=from.content
        complaintMail.title=from.title
        complaintMail.phone=from.phone
        complaintMail.create_time= new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
        });
        await this.complaintMailRepository.save(complaintMail)
    }

}