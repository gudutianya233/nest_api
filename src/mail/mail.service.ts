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
        to: '564836733@qq.com', //接受邮件的邮箱
        from: '1917996727@qq.com', //发送邮件的smtp的邮箱
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


 // 发送御生堂投诉内容邮件
 async complaintMail(from: any): Promise<any> {
    const date = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
    });
    // 保存信息到数据库中
    await this.saveComplaintMail(from);
    // 构造邮件主题
    const subject = `投诉标题:${from.title}-投诉时间:${date}-御生堂`;
    // 构造邮件正文
    const text = `投诉标题${from.title}\n投诉内容：${from.content}\n联系电话：${from.phone}`;
    // 构造邮件HTML格式
    const html = `<p>标题：${from.title}</p><p>内容：${from.content}</p><p>电话：${from.phone}</p>`;
    // 调用sendMail方法
    return await this.mailerService
      .sendMail({
        to: ['442683747@qq.com', '331073190@qq.com'], //接受邮件的邮箱
        from: '1917996727@qq.com', //发送邮件的smtp的邮箱
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


 //宝芝堂挂号信息发送邮件给管理员
async registerMail(user_register:UserRegister){
   // 构造邮件主题
   const subject = `【宝芝堂-公众号网页挂号缴费成功】`;
   const sex=user_register.patient.sex ? '男' : '女'
   let status = ''
   if (user_register.status == 2) {
     status = '上午'
   }
   else {
     status = '下午'
   }
   // 构造邮件正文
   const text = `就诊人：${user_register.patient_name}\n电话：${user_register.phone}\n性别：${sex}
   \n年龄：${user_register.patient.age}\n就诊医生：${user_register.doctor.name}
   \n挂号费：${user_register.pay_money}\n就诊日期${user_register.work_time}-${status}
   \n病请描述：${user_register.describe}`;
   // 构造邮件HTML格式
   const html = `<p>就诊人：${user_register.patient_name}</p><p>电话：${user_register.phone}</p>
   <p>性别：${sex}</p><p>年龄：${user_register.patient.age}</p><p>就诊医生：${user_register.doctor.name}</p>
   <p>挂号费：${user_register.pay_money}</p><p>就诊日期：${user_register.work_time}-${status}</p>
   <p>病请描述：${user_register.describe}</p>`;
    // 调用sendMail方法
    return await this.mailerService
      .sendMail({
        to: '1768400045@qq.com', //接受邮件的邮箱
       // to: ['wzy495678635@163.com','caolina12345678@163.com'], //接受邮件的邮箱
        from: '1917996727@qq.com', //发送邮件的smtp的邮箱
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

}