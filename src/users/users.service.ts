import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { User } from './entities/user.entity';
import { Connection, In, Like, Repository } from 'typeorm';
import { CommonFunctions } from './entities/commonFunctions.entity';
import { UserFollow } from './entities/user.follow.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { UserEvaluate } from './entities/user_evaluate.entity';
import { PatientsCard } from './entities/patients_card.entity';
import { UserRegister } from './entities/user_register.entity';
import { DoctorAppointment } from 'src/doctor/entities/doctor_appointment.entity';
import * as fs from 'fs';
import * as crypto from 'crypto'
import * as path from 'path';
import * as cron from 'node-cron';
import { JsapiTicket } from 'src/wechat_api/entities/Jsapi_ticket.entity';
import { WechatApiService } from 'src/wechat_api/wechat.service';
import { DoctorAssistant } from 'src/doctor/entities/doctor_assistant.entity';
import { SystemUser } from './entities/system_user.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { MailService } from 'src/mail/mail.service';
import { UserAdmin } from './entities/user_admin.entity';
@Injectable()
export class UsersService {
  // 定义一些微信支付的配置信息，如商户号、密钥、证书等
  private readonly config = {
    appid: process.env.APP_ID,
    mch_id: process.env.MCH_ID,
    key: process.env.KEY,
    pfx_key: process.env.PEF_URL_KEY,
    pfx_cert: process.env.PEF_URL_CERT,
    wx_pfx_key: process.env.WX_URL_KEY,
    wx_pfx_cert: process.env.WX_URL_CERT,
    notify_url: 'http://365bztm.bztzyg.com/user/userWeChatPaymentNotification'//支付消息通知的回调接口
  };
  //微信平台公钥
  private Wx_certPath = path.join(__dirname, '..', '..', this.config.wx_pfx_cert)
  private Wx_cert = fs.readFileSync(this.Wx_certPath, 'utf8');
  //微信平台私钥
  private Wx_keyPath = path.join(__dirname, '..', '..', this.config.wx_pfx_key);
  private Wx_privateKey = fs.readFileSync(this.Wx_keyPath, 'utf8');
  //商户公钥
  private certPath = path.join(__dirname, '..', '..', this.config.pfx_cert)
  private cert = fs.readFileSync(this.certPath, 'utf8');
  //商户私钥
  private keyPath = path.join(__dirname, '..', '..', this.config.pfx_key);
  private privateKey = fs.readFileSync(this.keyPath, 'utf8');
  //微信jspai支付，申请退款，查询退款情况
  private WxPay = require('wxpay-v3');
  private wxpay = new this.WxPay({
    private_key: this.privateKey,//私钥
    appid: process.env.APP_ID,//公众号ID 
    mchid: process.env.MCH_ID,//微信商户号 
    serial_no: process.env.SERIAL,//证书序列号
    apiv3_private_key: process.env.KEY,//v3设置的加密key
  });
  //创建一个 Wechatpay 实例(用来解密微信平台发送的数据)
  private WeChatPay = require('wechatpay-node-v3');
  private weChatPay = new this.WeChatPay({
    appid: this.config.appid,
    mchid: this.config.mch_id,
    publicKey: fs.readFileSync(this.certPath),
    privateKey: fs.readFileSync(this.keyPath),
    key: this.config.key,
    serial_no: process.env.SERIAL,
    userAgent: process.env.User_Agent,
  });
  constructor(
    private readonly httpService: HttpService,
    //注入WechatApiService
    @Inject(WechatApiService)
    private readonly wechatService: WechatApiService,
    //注入DoctorService
    @Inject(DoctorService)
    private readonly doctorService: DoctorService,
    //注入DoctorService
    @Inject(MailService)
    private readonly mailService: MailService,
    //用户信息
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    //用户常用功能
    @InjectRepository(CommonFunctions)
    private readonly commonFunctionsRepository: Repository<CommonFunctions>,
    //用户关注
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
    //用户评价
    @InjectRepository(UserEvaluate)
    private readonly userEvaluateRepository: Repository<UserEvaluate>,
    //就诊卡
    @InjectRepository(PatientsCard)
    private readonly patientsCardRepository: Repository<PatientsCard>,
    //医生信息
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    //用户订单(用户的挂号信息)
    @InjectRepository(UserRegister)
    private readonly userRegisterRepository: Repository<UserRegister>,
    //医生的预约
    @InjectRepository(DoctorAppointment)
    private readonly doctorAppointmentRepository: Repository<DoctorAppointment>,
    //微信js-sdk的签名JsapiTicket
    @InjectRepository(JsapiTicket)
    private readonly jsapiTicketRepository: Repository<JsapiTicket>,
    //医生绑定的助手
    @InjectRepository(DoctorAssistant)
    private readonly doctorAssistantRepository: Repository<DoctorAssistant>,
    //医生绑定的助手
    @InjectRepository(SystemUser)
    private readonly systemUserRepository: Repository<SystemUser>,
    //微信中的管理员表
    @InjectRepository(UserAdmin)
    private readonly userAdminRepository: Repository<UserAdmin>,

    //nest事务
    private connection: Connection,
  ) {
    //定时任务，修改已签到的订单为就诊完成
    this.scheduleCronJob();
  }

  ///运维系统
  //搜索匹配医生名字的用户评价
  async searchUserEvaluate(name: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.userEvaluateRepository.count({
          where: { evaluate_name: Like(`%${name}%`) },
        });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.userEvaluateRepository
      .createQueryBuilder('user_evaluate')
      .leftJoinAndSelect('user_evaluate.doctor', 'doctor')
      .where('user_evaluate.evaluate_name LIKE :name', { name: `%${name}%` })
      .orderBy('user_evaluate.create_time', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();

    return { data, total };
  }

  //修改选中的评价的状态
  async changeUserEvaluateStatus(id: number, status: boolean) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        UserEvaluate,
        id,
        {
          status: status,
          update_time: updateDate
        },
      );

      await queryRunner.commitTransaction();

      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //删除选中的评价
  async removeUserEvaluate(id: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(UserEvaluate, id);

      await queryRunner.commitTransaction();

      if (result.affected > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //保存评价
  async saveUserEvaluate(userEvaluate: UserEvaluate, doctorId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userEvaluates = new UserEvaluate();
      userEvaluates.evaluate_name = userEvaluate.evaluate_name
      userEvaluates.doctor_name = userEvaluate.doctor_name
      userEvaluates.status = userEvaluate.status
      userEvaluates.content = userEvaluate.content
      userEvaluates.stars = userEvaluate.stars
      userEvaluates.create_time = Math.floor(Date.now() / 1000);
      // 获取一个 Doctor 实体
      const doctor = await queryRunner.manager.findOne(Doctor, {
        where: { id: doctorId },
      });
      // 设置 UserEvaluate.doctor 属性
      userEvaluates.doctor = doctor;


      const res = await queryRunner.manager.save(userEvaluates);

      await queryRunner.commitTransaction();

      if (res) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //修改选中的评价
  async changeUserEvaluate(userEvaluate: UserEvaluate) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        UserEvaluate,
        userEvaluate.id,
        {
          evaluate_name: userEvaluate.evaluate_name,
          stars: userEvaluate.stars,
          content: userEvaluate.content,
          status: userEvaluate.status,
          update_time: updateDate,
        },
      );

      await queryRunner.commitTransaction();

      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //搜索匹配名字的就诊卡
  async searchPatientsCard(name: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.patientsCardRepository.count({
          where: { name: Like(`%${name}%`) },
        });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.patientsCardRepository
      .createQueryBuilder('patients_card')
      .leftJoinAndSelect('patients_card.user', 'user')
      .where('patients_card.name LIKE :name', { name: `%${name}%` })
      .orderBy('patients_card.create_time', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();
    return { data, total };
  }
  //删除选中的就诊卡
  async removePatientsCard(id: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(PatientsCard, id);

      await queryRunner.commitTransaction();

      if (result.affected > 0) {
        return { code: 200, message: '删除成功' };
      } else {
        return { code: 402, message: '删除失败' };;
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      // 检查错误消息是否包含 "foreign key constraint fails"
      if (err.message.includes("foreign key constraint fails")) {
        return { code: 402, message: "当前就诊卡有就诊订单，无法删除，需要联系工作人员进行删除" };
      } else {
        throw err;
      }
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //添加就诊卡时,搜索用户的名字查询到需要绑定的用户
  async searchPatientsCardUser(nickname: string, page: number, pageSize: number) {
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.nickname LIKE :nickname', { nickname: `%${nickname}%` })
      .skip(skip)
      .take(pageSize)
      .getMany();
    return data
  }
  //保存添加的就诊卡
  async savePatientsCard(patientsCard: PatientsCard, userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 查询是否已经存在这个就诊卡
      const existingCard = await queryRunner.manager.findOne(PatientsCard, {
        where: { id_number: patientsCard.id_number },
      });
      // 如果已经存在这个就诊卡，那么抛出一个错误或者返回一个错误消息
      if (existingCard) {
        await queryRunner.rollbackTransaction();
        return { code: 401, message: '就诊卡已经存在' };
      }
      // 如果不存在这个就诊卡，那么添加新的就诊卡
      const patientsCards = new PatientsCard();
      patientsCards.name = patientsCard.name
      patientsCards.phone = patientsCard.phone
      patientsCards.age = patientsCard.age
      patientsCards.sex = patientsCard.sex
      patientsCards.id_type = patientsCard.id_type
      patientsCards.id_number = patientsCard.id_number
      patientsCards.create_time = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      // 获取一个 User 实体
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      // 设置 patientsCards.user 属性
      patientsCards.user = user;
      const res = await queryRunner.manager.save(patientsCards);
      await queryRunner.commitTransaction();
      if (res) {
        return { code: 200, message: '添加成功' }
      } else {
        return { code: 401, message: '添加就诊卡失败' };
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      // 检查错误消息
      if (err.message.includes('duplicate')) {
        // 如果错误消息中包含 "duplicate"，则可能是由于账号或名字重复
        return { code: 401, message: '账号或者名字重复' };
      } else {
        // 如果错误消息中不包含 "duplicate"，则返回通用错误提示
        return { code: 401, message: '添加就诊卡失败' };
      }
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //修改选中的就诊卡
  async changePatientsCard(patientsCard: PatientsCard) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        PatientsCard,
        patientsCard.id,
        {
          name: patientsCard.name,
          phone: patientsCard.phone,
          age: patientsCard.age,
          sex: patientsCard.sex,
          id_type: patientsCard.id_type,
          id_number: patientsCard.id_number,
          update_time: updateDate,
        },
      );

      await queryRunner.commitTransaction();

      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //搜索匹配微信名称的用户
  async searchUser(nickname: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.userRepository.count({
          where: { nickname: Like(`%${nickname}%`) },
        });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.userRepository
      .createQueryBuilder('user')
      .where('user.nickname LIKE :nickname', { nickname: `%${nickname}%` })
      .orderBy('user.create_time', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();
    return { data, total };
  }
  //修改选中的用户信息
  async changeUser(user: User) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        User,
        user.id,
        {
          openid: user.openid,
          unionid: user.unionid,
          nickname: user.nickname,
          city: user.city,
          province: user.province,
          country: user.country,
          update_time: updateDate,
        },
      );

      await queryRunner.commitTransaction();

      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //搜索匹配用户名字的关注信息
  async searchUserFollow(user_name: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.userFollowRepository.count({
          where: { user_name: Like(`%${user_name}%`) },
        });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.userFollowRepository
      .createQueryBuilder('user_follow')
      .leftJoinAndSelect('user_follow.user', 'user')
      .where('user_follow.user_name LIKE :user_name', { user_name: `%${user_name}%` })
      .orderBy('user_follow.follow_time', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();

    return { data, total };
  }
  //修改选中的用户关注信息
  async changeUserFollow(userFollow: UserFollow) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        UserFollow,
        userFollow.id,
        {
          user_name: userFollow.user_name,
          doctor_name: userFollow.doctor_name,
          follow_time: updateDate
        },
      );

      await queryRunner.commitTransaction();

      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //删除选中的关注信息
  async removeUserFollow(id: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(UserFollow, id);

      await queryRunner.commitTransaction();

      if (result.affected > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //搜索匹配用户名字/电话的未退款的订单(订单状态为0，1，2，3)
  async searchUserRegister(search: string | number, page: number, pageSize: number) {
    if (search != "") {
      // 尝试将 search 转换为数字
      var searchNumber = Number(search);
    }
    // 如果转换成功，那么 search 是一个电话号码
    if (!isNaN(searchNumber)) {
      search = searchNumber;
      // 计算要查询的数据总条数
      const total = await this.userRegisterRepository.count({
        where: {
          patient_name: Like(`%${search}%`),
          order_status: In([0, 1, 2, 3]),
        },
      });
      // 计算要跳过的条目数
      const skip = (page - 1) * pageSize;
      // 查询数据
      const data = await this.userRegisterRepository
        .createQueryBuilder('user_register')
        .leftJoinAndSelect('user_register.user', 'user')
        .leftJoinAndSelect('user_register.doctor', 'doctor')
        .leftJoinAndSelect('user_register.patient', 'patient')
        .leftJoinAndSelect('user_register.doctorAppointment', 'doctorAppointment')
        .where('user_register.phone LIKE :phone', { phone: `%${search}%` })
        .andWhere('user_register.order_status IN (:...order_status)', { order_status: [0, 1, 2, 3] })
        .orderBy('user_register.create_time', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany();
      return { data, total };
    }
    else {
      //search是名字
      // 计算要查询的数据总条数
      const total = await this.userRegisterRepository.count({
        where: {
          patient_name: Like(`%${search}%`),
          order_status: In([0, 1, 2, 3]),
        },
      });
      // 计算要跳过的条目数
      const skip = (page - 1) * pageSize;
      // 查询数据
      const data = await this.userRegisterRepository
        .createQueryBuilder('user_register')
        .leftJoinAndSelect('user_register.user', 'user')
        .leftJoinAndSelect('user_register.doctor', 'doctor')
        .leftJoinAndSelect('user_register.patient', 'patient')
        .leftJoinAndSelect('user_register.doctorAppointment', 'doctorAppointment')
        .where('user_register.patient_name LIKE :patient_name', { patient_name: `%${search}%` })
        .andWhere('user_register.order_status IN (:...order_status)', { order_status: [0, 1, 2, 3] })
        .orderBy('user_register.create_time', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany();
      return { data, total };
    }
  }
  //退款页面获取退款相关的订单(订单状态为4，5，6)，匹配就诊人名字/电话
  async searchRefundUserRegister(search: string | number, page: number, pageSize: number) {
    if (search != "") {
      // 尝试将 search 转换为数字
      var searchNumber = Number(search);
    }
    // 如果转换成功，那么 search 是一个电话号码
    if (!isNaN(searchNumber)) {
      search = searchNumber;
      // 查询数据库，获取数据总条目数
      const total = await this.userRegisterRepository.count({
        where: {
          patient_name: Like(`%${search}%`),
          order_status: In([4, 5, 6])
        },
      });
      // 计算要跳过的条目数
      const skip = (page - 1) * pageSize;
      const data = await this.userRegisterRepository
        .createQueryBuilder('user_register')
        .leftJoinAndSelect('user_register.user', 'user')
        .leftJoinAndSelect('user_register.doctor', 'doctor')
        .leftJoinAndSelect('user_register.patient', 'patient')
        .leftJoinAndSelect('user_register.doctorAppointment', 'doctorAppointment')
        .where('user_register.phone LIKE :phone', { phone: `%${search}%` })
        .andWhere('user_register.order_status IN (:...order_status)', { order_status: [4, 5, 6] })
        .orderBy('user_register.create_time', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany();

      return { data, total };
    }
    else {
      //search是名字
            // 查询数据库，获取数据总条目数
            const total = await this.userRegisterRepository.count({
              where: {
                patient_name: Like(`%${search}%`),
                order_status: In([4, 5, 6])
              },
            });
      // 计算要跳过的条目数
      const skip = (page - 1) * pageSize;
      const data = await this.userRegisterRepository
        .createQueryBuilder('user_register')
        .leftJoinAndSelect('user_register.user', 'user')
        .leftJoinAndSelect('user_register.doctor', 'doctor')
        .leftJoinAndSelect('user_register.patient', 'patient')
        .leftJoinAndSelect('user_register.doctorAppointment', 'doctorAppointment')
        .where('user_register.patient_name LIKE :patient_name', { patient_name: `%${search}%` })
        .andWhere('user_register.order_status IN (:...order_status)', { order_status: [4, 5, 6] })
        .orderBy('user_register.create_time', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany();
      return { data, total };
    }


  }

  //搜索匹配用户名字的关注信息
  async searchAccount(name: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.systemUserRepository.count({
          where: { name: Like(`%${name}%`) },
        });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.systemUserRepository
      .createQueryBuilder('system_user')
      .where('system_user.name LIKE :name', { name: `%${name}%` })
      .orderBy('system_user.create_time', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();
    return { data, total };
  }

  //添加运维账号(管理员账号才有这个权限)
  async saveAccount(systemUser: SystemUser, account: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //先验证当前登录的账号是否有权限
      const admin = await this.systemUserRepository.findOne({ where: { account: account } })
      if (!admin || admin.roles !== 1) {
        return { code: 402, message: '没有权限' }
      }
      //生成8位随机字符串,作为密码盐
      const salt = Math.random().toString(36).substring(2, 10);
      const systemUsers = new SystemUser();
      systemUsers.account = systemUser.account
      systemUsers.name = systemUser.name
      systemUsers.salt = salt
      systemUsers.roles = 0
      const hash = crypto.createHash('sha256');
      hash.update(systemUser.password + salt);
      const hashedInputPassword = hash.digest('hex');
      systemUsers.password = hashedInputPassword
      systemUsers.create_time = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });

      const res = await queryRunner.manager.save(systemUsers);
      await queryRunner.commitTransaction();
      if (res) {
        return { code: 200, message: '添加运维账号成功' };
      } else {
        return { code: 402, message: '添加运维账号失败' };
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //删除选中的运维账号
  async removeAccount(id: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(SystemUser, id);

      await queryRunner.commitTransaction();

      if (result.affected > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //修改运维账号的信息
  async changeAccount(systemUser: SystemUser) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const result = await this.systemUserRepository.findOne({
        where: { id: systemUser.id },
      });
      const hash = crypto.createHash('sha256');
      hash.update(systemUser.password + result.salt);
      const hashedInputPassword = hash.digest('hex');
      const res = await queryRunner.manager.update(
        SystemUser,
        systemUser.id,
        {
          roles: systemUser.roles,
          name: systemUser.name,
          password: hashedInputPassword,
          update_time: updateDate
        },
      );

      await queryRunner.commitTransaction();
      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      return success;
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //微信端
  // 使用code换取access_token和openid
  async getAccessToken(code: string) {
    const appId = process.env.APP_ID;
    const secret = process.env.APP_SECRET;
    const authorization_code = 'authorization_code';
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=${authorization_code}`;
    const response$ = this.httpService.get(url);
    const response = await firstValueFrom(response$);
    const data = response.data;
    return data;
  }

  // 使用access_token和openid获取用户信息
async getUserInfo(access_token: string, openid: string) {
    // 拼接请求地址
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    // 发起get请求
    const response$ = this.httpService.get(url);
    // 获取响应
    const response = await firstValueFrom(response$);
    // 获取响应数据
    const data = response.data;
    // console.log(data)
    // 判断响应数据是否有错误
    if (!data.errcode) {
      // 创建用户实例
      const users = new User();
      // 设置用户信息
      users.city = data.city;
      users.country = data.country;
      users.openid = data.openid;
      users.unionid = data.unionid;
      users.nickname = data.nickname;
      users.province = data.province;
      users.headimgurl = data.headimgurl;
      // 设置创建时间和授权时间
      users.create_time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      users.authorize_time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      // users.privilege = data.privilege;
      // 调用创建或更新用户方法
      await this.createOrUpdateUser(users);
      //  console.log('正确返回用户信息')
      return data.openid;
    }
    // console.log('错误返回')
    return false;
  }
  
  // 创建或更新用户方法
  async createOrUpdateUser(userInfo: User) {
    // 查询用户
    const users = await this.userRepository.findOne({
      where: { openid: userInfo.openid },
    });
    // 判断是否有该用户
    if (users) {
      // // 更新用户信息
      // await this.userRepository.update(users.id, userInfo);
    const updateInfo = { ...userInfo };
    delete updateInfo.create_time; // 不更新 create_time
    await this.userRepository.update(users.id, updateInfo);
    } else {
      // 创建新用户
      //   console.log('创建新用户',userInfo)
      await this.userRepository.save(userInfo);
    }
  }

  //从数据库获取用户信息
  async getUserInformation(openid: string) {
    const user = await this.userRepository.findOne({ where: { openid } });
    return user;
  }

  //获取用户信息页面的启用的功能
  async getCommonFunction() {
    const res = await this.commonFunctionsRepository.find({ where: { status: true } })
    return res;
  }


  //获取用户id
  async getUserId(openId: string) {
    const userId = await this.userRepository.findOne({ where: { openid: openId } })
    return userId.id
  }

  //获取用户是否关注了当前医生
  async checkIfUserFollowsDoctor(userId: number, doctorId: number) {
    let res = false
    const follow = await this.userFollowRepository.findOne({
      where: { doctor: { id: doctorId }, user: { id: userId } },
    });

    if (follow != null) {
      res = true
    }
    return res;
  }
  //获取用户关注的医生数量
  async getUserFollowCount(userId: number) {
    const count = await this.userFollowRepository.count({
      where: {
        user: { id: userId }
      }
    });
    return count;
  }
  //获取用户关注的医生信息
  async getUserFollowInfo(userId: number) {
    const doctors = await this.userFollowRepository.find({
      where: {
        user: { id: userId }
      },
      relations: ['doctor']
    });
    return doctors.map(follow => follow.doctor);
  }
  //当前用户关注当前医生,当前医生的关注量加一
  async userFollowDoctor(userId: number, doctorId: number, openId: string) {
    const userFollow = new UserFollow();
    // 从数据库中查询user和doctor对象
    const user = await this.userRepository.findOneBy({ id: userId });
    const doctor = await this.doctorRepository.findOneBy({ id: doctorId });
    //当前医生关注量加一
    doctor.attention += 1;
    // 给userFollow对象赋值
    userFollow.user = user;
    userFollow.doctor = doctor;
    userFollow.openid = openId;
    userFollow.follow_time = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
    });
    // 从user和doctor对象中获取nickname和name属性，并赋值给user_name和doctor_name属性
    userFollow.user_name = user.nickname;
    userFollow.doctor_name = doctor.name;
    // 在保存之前，先查询数据库中是否已经存在相同的userId和doctorId
    const existingRecord = await this.userFollowRepository.findOne({
      where: { user: { id: userId }, doctor: { id: doctorId } },
    });
    // 如果存在，则不执行保存操作，返回false
    if (existingRecord) {
      return false;
    }
    // 如果不存在，则继续保存操作，返回true
    try {
      await this.userFollowRepository.save(userFollow);
      await this.doctorRepository.save(doctor);
      return true;
    } catch (error) {
      return false;
    }
  }



  //当前用户取消关注当前医生,当前医生关注量减一
  async userCancellationFollowDoctor(userId: number, doctorId: number) {
    try {
      // 查找用户关注医生的记录
      const userFollow = await this.userFollowRepository.findOne({
        where: { user: { id: userId }, doctor: { id: doctorId } },
      });
      const doctor = await this.doctorRepository.findOneBy({ id: doctorId });
      //当前医生关注量减一
      doctor.attention -= 1;
      // 如果找到了记录，则删除它
      if (userFollow) {
        await this.userFollowRepository.remove(userFollow);
      }
      await this.doctorRepository.save(doctor);
      // 如果操作成功，则返回 true
      return true;
    } catch (error) {
      // 如果发生错误，则返回 false
      return false;
    }
  }

  //获取5条通过的评价,hasMore参数表示是否已经查询完所有数据，hasMore为true，表示还有数据，为false则已经查询完所有评价了
  async getUserEvaluateWeChat(skip: number, take: number, doctorId: number) {
    const userEvaluates = await this.userEvaluateRepository
      .createQueryBuilder('user_evaluate')
      .leftJoinAndSelect('user_evaluate.doctor', 'doctor')
      .where('user_evaluate.status = :status', { status: true })
      .andWhere('doctor.id = :doctorId', { doctorId })
      .orderBy('user_evaluate.create_time', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();
    const count = await this.userEvaluateRepository.count({
      where: {
        status: true
      }
    });
    const hasMore = skip + take < count;
    return { userEvaluates, hasMore };
  }

  //获取当前医生通过的评价条数
  async getUserEvaluateWeChatCount(doctorId: number) {
    const count = await this.userEvaluateRepository.count({
      where: {
        doctor: { id: doctorId },
        status: true,
      },
    });
    return count;
  }
  //获取当前用户的所有就诊卡
  async getUserPatientsCardWeChat(userId: number) {
    const patientsCards = await this.patientsCardRepository
      .createQueryBuilder('patients_card')
      .where('patients_card.userId =:userId', { userId: userId })
      .getMany();
    return patientsCards;
  }
  //获得当前用户的所有挂号信息
  async getUserRegister(userId: number) {
    const patientsCards = await this.userRegisterRepository
      .createQueryBuilder('user_register')
      .where('user_register.userId =:userId', { userId: userId })
      .leftJoinAndSelect('user_register.doctor', 'doctor')
      .leftJoinAndSelect('user_register.patient', 'patient')
      .leftJoinAndSelect('user_register.user', 'user')
      .orderBy('user_register.create_time', 'DESC')
      .getMany();
    return patientsCards;
  }

  //用户在挂号页面提交,创建订单,创建预付单
  async userRegisterPlaceOrder(userRegister: UserRegister, doctorId: number, patientId: number, userId: number) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //const userRegisterRepository = queryRunner.manager.getRepository(UserRegister);
      // const doctorRepository = queryRunner.manager.getRepository(Doctor);
      // const patientsCardRepository = queryRunner.manager.getRepository(PatientsCard);
      // const userRepository = queryRunner.manager.getRepository(User);
      // 检查数据库中是否已经存在具有相同 work_time，status，patient 和 doctor 属性值的订单
      const existingOrder = await this.userRegisterRepository.createQueryBuilder('user_register')
        .innerJoinAndSelect('user_register.patient', 'patient')
        .innerJoinAndSelect('user_register.doctor', 'doctor')
        .where('user_register.work_time = :work_time', { work_time: userRegister.work_time })
        .andWhere('user_register.status = :status', { status: userRegister.status })
        //  .andWhere('user_register.order_status = :order_status', { order_status: userRegister.order_status })
        .andWhere('patient.id = :patientId', { patientId })
        .andWhere('doctor.id = :doctorId', { doctorId })
        .getOne();
      // 如果找到了匹配的订单，先判断订单的状态是否是待支付，待就诊，如果是就不创建新订单
      if (existingOrder && (existingOrder.order_status == 0 || existingOrder.order_status == 1)) {
        return { status: 401, message: '已经有当前医生的当日挂号订单' }
      }
      const userRegisters = new UserRegister()
      userRegisters.patient_name = userRegister.patient_name;
      userRegisters.phone = userRegister.phone;
      userRegisters.id_number = userRegister.id_number;
      userRegisters.work_time = userRegister.work_time;
      userRegisters.status = userRegister.status;
      userRegisters.describe = userRegister.describe;
      userRegisters.pay_money = userRegister.pay_money;
      userRegisters.order_status = 0
      userRegisters.create_time = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai'
      });
      // 根据前端传递的doctorId，从数据库中查询医生实体
      const doctor = await this.doctorRepository.findOneBy({ id: doctorId });
      // 如果找到了医生实体，将其赋值给userRegisters.doctor属性
      if (doctor) {
        userRegisters.doctor = doctor;
      }
      // 根据前端传递的patientId，从数据库中查询医生实体
      const patient = await this.patientsCardRepository.findOneBy({ id: patientId });
      // 如果找到了就诊卡实体，将其赋值给userRegisters.patient属性
      if (patient) {
        userRegisters.patient = patient;
      }
      // 根据前端传递的userId，从数据库中查询用户实体
      const user = await this.userRepository.findOneBy({ id: userId });
      // 如果找到了就诊卡实体，将其赋值给userRegisters.patient属性
      if (user) {
        userRegisters.user = user;
      }
      //系统订单生成成功
      const res = await this.userRegisterRepository.save(userRegisters)
      //把当前医生的当日挂号数量减一,总挂号数量加一
      await this.doctorService.registerNumberReduce(userRegister.work_time, userRegister.doctor)
      // 在保存订单后，使用返回的订单实体中的id属性来生成系统订单号
      if (res) {
        // 获取当前日期
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        // 拼接订单号
        const orderNumber = `${year}${month}${day}${res.id.toString().padStart(8, '0')}`;
        res.SystemNumber = orderNumber
        //新订单创建成功
        await this.userRegisterRepository.save(res);
        //请求调用微信统一下单接口，获取prepay_id和其他支付参数
        const result = await this.wxpay.jsapi({
          //商户号
          mchid: this.config.mch_id,
          //商户的订单号
          out_trade_no: res.SystemNumber,
          appid: this.config.appid,
          notify_url: this.config.notify_url,
          //订单备注
          description: `挂号医生` + `${doctor.name}` + `就诊人` + `${userRegister.patient_name}`,
          amount: {
            //费用,单位分 
            total: Math.round(doctor.registration_cost * 100),
            currency: 'CNY'
          },
          payer: {
            openid: user.openid
          }
        })
        console.log(result);
        if (result.status == 200) {
          await queryRunner.commitTransaction();
          return result
        }
        else {
          const results = JSON.parse(result.data)
          return { status: 403, message: `${results.message}` }
        }
      }
      return { status: 400, message: '下单失败,请重新挂号' }
    } catch (err) {
      // 如果有错误发生，回滚事务
      await queryRunner.rollbackTransaction();
      throw err; // 抛出错误
    } finally {
      // 无论如何，最后都要释放 queryRunner
      await queryRunner.release();
    }
  }
  //用户在我的订单页面,点击支付,拉起微信jsapi支付
  async reservationPlaceOrder(userRegister: UserRegister) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //请求调用微信统一下单接口，获取prepay_id和其他支付参数
      const result = await this.wxpay.jsapi({
        //商户号
        mchid: this.config.mch_id,
        //商户的订单号
        out_trade_no: userRegister.SystemNumber,
        appid: this.config.appid,
        notify_url: this.config.notify_url,
        //订单备注
        description: `挂号医生` + `${userRegister.doctor.name}` + `就诊人` + `${userRegister.patient_name}`,
        amount: {
          //费用,单位分 
          total: Math.round(userRegister.doctor.registration_cost * 100),
          currency: 'CNY'
        },
        payer: {
          openid: userRegister.user.openid
        }
      })
      //console.log(result);
      if (result.status == 200) {
        await queryRunner.commitTransaction();
        return result
      }

      return { status: 400, data: '微信预下单失败' }
    } catch (err) {
      // 如果有错误发生，回滚事务
      await queryRunner.rollbackTransaction();
      throw err; // 抛出错误
    } finally {
      // 无论如何，最后都要释放 queryRunner
      await queryRunner.release();
    }
  }

  //对前端的调用js-sdk签名进行sha1签名,  配置wx.config的签名
  async getSignature(params: any) {
    const Jsapi_ticket = await this.jsapiTicketRepository.createQueryBuilder('Jsapi_ticket')
      .orderBy('Jsapi_ticket.create_time', 'DESC')
      .getOne();
    const ticket = Jsapi_ticket.Jsapi_ticket
    params.jsapi_ticket = ticket
    const sortedKeys = Object.keys(params).sort();
    // 拼接成字符串
    let string1 = '';
    for (const key of sortedKeys) {
      string1 += `${key}=${params[key]}&`;
    }
    // 去掉最后一个&
    string1 = string1.slice(0, -1);
    // 创建sha1加密对象
    const sha1 = crypto.createHash('sha1');
    // 对string1进行sha1加密
    const signature = sha1.update(string1).digest('hex');
    return signature
  }
  //对前端的调用wx.chooseWXPay签名进行RSA签名
  async getPaySign(params: any) {
    //const sortedKeys = Object.keys(params).sort(); 
    const sortedKeys = ['appId', 'timestamp', 'nonceStr', 'package'];
    // 拼接成字符串
    let string1 = '';
    for (const key of sortedKeys) {
      string1 += `${params[key]}\n`;
    }
    // 创建rsa加密对象 
    // 创建签名对象
    const sign = crypto.createSign('RSA-SHA256');
    // 更新数据
    sign.update(string1)
    // 计算签名，并转换为base64编码
    const paySign = sign.sign(this.privateKey, 'base64');
    return paySign
  }

  //用户在前端使用微信的js-sdk支付后。微信服务器定时发起订单的支付通知
  // 先验证数据，如果数据显示支付成功，那么就创建一个医生的预约数据,并且给超级管理员发送邮件。
  async userWeChatPaymentNotification(headers: any, data: any) {
    // 第一步：检查平台证书序列号
    const serial = headers['wechatpay-serial'];
    if (serial !== process.env.WE_CHAT_SERIAL) {
      // 如果序列号不匹配，重新获取证书(用代码获取或者前往商户平台下载新的证书)
      // 目前是用官方工具(java的jar包)来下载的证书
      return { code: 'Fail', message: '平台证书不匹配' }
    }
    // 第二步：获得验签字符串的数据
    const timestamp = headers['wechatpay-timestamp'];//时间戳
    const nonce = headers['wechatpay-nonce'];//随机字符串
    const signature = headers['wechatpay-signature'];//应答签名
    const body = JSON.stringify(data)
    //构造验签名串
    const message = `${timestamp}\n${nonce}\n${body}\n`;
    // 验证签名
    const signVerified = this.verifySignature(message, signature);
    if (signVerified) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // 签名验证成功，处理支付通知
      try {
        // 从 data 中获取 resource 字段
        const resource = data.resource;
        // 调用 decipher_gcm 方法，回调解密
        const result: any = await this.weChatPay.decipher_gcm(resource.ciphertext, resource.associated_data, resource.nonce, this.config.key);
        //微信返回的系统订单号
        const SystemNumber = result.out_trade_no
        //创建医生的预约单
        //根据解密后的数据得到商户订单号,根据SystemNumber从数据库中查询匹配的用户订单实例
        // const userOrder = await this.userRegisterRepository.findOne({ where: { SystemNumber: SystemNumber } });
        const userOrder = await this.userRegisterRepository.createQueryBuilder('user_register')
          .leftJoinAndSelect('user_register.user', 'user')
          .leftJoinAndSelect('user_register.doctor', 'doctor')
          .leftJoinAndSelect('user_register.patient', 'patient')
          .leftJoinAndSelect('user_register.doctorAppointment', 'doctorAppointment')
          .where('user_register.SystemNumber = :SystemNumber', { SystemNumber: SystemNumber })
          .getOne();
        // 如果找到了用户订单实例
        if (userOrder) {
          userOrder.pay_money = result.amount.payer_total / 100;
          // 将success_time的值转换为Date对象
          let date = new Date(result.success_time);
          // 使用toLocaleString方法指定locale和options
          let formattedDate = date.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
          });
          userOrder.pay_time = formattedDate
          userOrder.WeChatNumber = result.transaction_id;
          userOrder.order_status = 1;
          userOrder.update_time = new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
          });
          // 创建一个医生预约实例
          const doctorAppointments = new DoctorAppointment();
          // 设置医生预约的属性
          doctorAppointments.doctor = userOrder.doctor;
          doctorAppointments.patient = userOrder.patient;
          doctorAppointments.user_register = userOrder;
          doctorAppointments.patient_name = userOrder.patient_name;
          doctorAppointments.phone = userOrder.phone;
          doctorAppointments.work_time = userOrder.work_time;
          doctorAppointments.status = userOrder.status;
          doctorAppointments.doctor_status = 0;
          doctorAppointments.create_time = new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
          });
          // 在保存医生预约实例之前，使用findOne方法，并传入一个条件对象，用来过滤查询结果
          const existingDoctorAppointment = await this.doctorAppointmentRepository.findOne({
            where: { user_register: { id: userOrder.id } }
          });
          // 判断此订单是否已经有了医生的预约
          if (existingDoctorAppointment) {
            // 如果不为空，表示已经有医生预约记录,直接返回微信成功
            return { code: 'SUCCESS', message: '成功' };
          } else {
            // 如果为空，表示没有重复的user_register_id值，继续保存医生预约实例
            //保存保存医生预约实例
            await this.doctorAppointmentRepository.save(doctorAppointments)
            // 将医生预约实例赋值给用户订单实例的doctor_appointment属性
            userOrder.doctorAppointment = doctorAppointments;
            // 保存用户订单实例到数据库，并设置外键列的值
            await this.userRegisterRepository.save(userOrder);
            //给用户推送挂号消息
            await this.sendOrderSuccessMessage(userOrder.user.openid, userOrder)
            //查询当前医生所绑定的助手信息
            const doctorAssistantList = await this.doctorAssistantRepository.find(
              {
                where: {
                  doctor: { id: userOrder.doctor.id }
                }
              }
            )
            // 定义一个for循环，遍历数组中的每个数据
            for (let i = 0; i < doctorAssistantList.length; i++) {
              // 获取当前数据的openid属性
              let openid = doctorAssistantList[i].openid;
              //医生的助手推送挂号消息
              await this.sendDoctorAssistantMessage(openid, userOrder);
            }
            //查询微信用户的管理员表中启用的管理员
            const admin = await this.userAdminRepository.find({
              where: {
                status: true
              }
            })
            // 定义一个for循环，遍历数组中的每个数据
            for (let i = 0; i < admin.length; i++) {
              // 获取当前数据的openid属性
              let openid = admin[i].openid;
              //给管理员推送挂号消息
              await this.sendAdminMessage(openid, userOrder);
            }

            //给管理员发送挂号信息邮件
            await this.mailService.registerMail(userOrder)
            await queryRunner.commitTransaction();
            return { code: 'SUCCESS', message: '成功' }
          }
        }
      } catch (err) {
        // 数据解密错误
        console.error(err);
        // 如果有错误发生，回滚事务
        await queryRunner.rollbackTransaction();
        return { code: 'FAIL', message: err };
      } finally {
        // 无论如何，最后都要释放 queryRunner
        await queryRunner.release();
      }
    } else {
      // 签名验证失败，抛出错误 
      throw new Error('签名验证失败');
    }
  }
  //验签方法
  verifySignature(message: string, signature: string): boolean {
    const verifier = crypto.createVerify('sha256');
    verifier.update(message);
    // 将签名进行base64解码 
    const signatureBuffer = Buffer.from(signature, 'base64');
    return verifier.verify(this.Wx_cert, signatureBuffer);
  }

  //给用户推送挂号消息
  async sendOrderSuccessMessage(openid: string, userRegister: UserRegister) {
    let status = ''
    if (userRegister.status == 2) {
      status = '上午'
    }
    else {
      status = '下午'
    }
    //消息点击后，跳转到指定页面
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: '您好，您已预约挂号成功。',
        color: '#173177'
      },
      //姓名
      patientName: {
        value: `${userRegister.patient_name}`,
        color: '#173177'
      },
      //性别
      patientSex: {
        value: userRegister.patient.sex ? '男' : '女',
        color: '#173177'
      },
      //预约医院
      hospitalName: {
        value: '成都宝芝堂中医馆',
        color: '#173177'
      },
      //预约科室
      department: {
        value: `${userRegister.doctor.name}医生诊室`,
        color: '#173177'
      },
      //预约医生
      doctor: {
        value: `${userRegister.doctor.name}：${userRegister.work_time}-${status}`,
        color: '#173177'
      },
      //流水号
      seq: {
        value: userRegister.SystemNumber,
        color: '#173177'
      },
      remark: {
        value: '请您准时到达取号。',
        color: '#173177'
      }
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }
  //给医生助理推送挂号信息
  async sendDoctorAssistantMessage(openid: string, userRegister: UserRegister) {
    let status = ''
    if (userRegister.status == 2) {
      status = '上午'
    }
    else {
      status = '下午'
    }
    //消息点击后，跳转到指定页面(当前医生的预约信息的手机-医生助手)
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: `${userRegister.patient_name} 挂号成功`,
        color: '#173177'
      },
      //姓名
      patientName: {
        value: `${userRegister.patient_name}-${userRegister.patient.phone}-医生助手`,
        color: '#173177'
      },
      //性别
      patientSex: {
        value: userRegister.patient.sex ? '男' : '女',
        color: '#173177'
      },
      //预约医院
      hospitalName: {
        value: '中医馆',
        color: '#173177'
      },
      //预约科室
      department: {
        value: `${userRegister.doctor.name}医生诊室`,
        color: '#173177'
      },
      //预约医生
      doctor: {
        value: `${userRegister.doctor.name}：${userRegister.work_time}-${status}`,
        color: '#173177'
      },
      //流水号
      seq: {
        value: userRegister.SystemNumber,
        color: '#173177'
      }
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }
  /**
   * 给管理员推送挂号信息
   * @param openid 
   * @param userRegister 
   */
  async sendAdminMessage(openid: string, userRegister: UserRegister) {
    let status = ''
    if (userRegister.status == 2) {
      status = '上午'
    }
    else {
      status = '下午'
    }
    //消息点击后，跳转到指定页面(所有挂号信息)
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: `${userRegister.patient_name} 挂号成功`,
        color: '#173177'
      },
      //姓名
      patientName: {
        value: `${userRegister.patient_name}-${userRegister.patient.phone}-管理员`,
        color: '#173177'
      },
      //性别
      patientSex: {
        value: userRegister.patient.sex ? '男' : '女',
        color: '#173177'
      },
      //预约医院
      hospitalName: {
        value: '中医馆',
        color: '#173177'
      },
      //预约科室
      department: {
        value: `${userRegister.doctor.name}医生诊室`,
        color: '#173177'
      },
      //预约医生
      doctor: {
        value: `${userRegister.doctor.name}：${userRegister.work_time}-${status}`,
        color: '#173177'
      },
      //流水号
      seq: {
        value: userRegister.SystemNumber,
        color: '#173177'
      },
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }

  //用户申请退款,向微信发起退款请求
  async userWeChatRefund(userRegister: UserRegister) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //生成6位随机字符串
      const randomStr = Math.random().toString(36).substring(2, 8);
      // 创建退款请求对象
      const refundRequest = {
        transaction_id: userRegister.WeChatNumber, // 微信订单号
        out_refund_no: `${userRegister.WeChatNumber}` + `${randomStr}`,//退款订单号
        funds_account: 'AVAILABLE', // 退款资金来源
        notify_url: 'http://365bztm.bztzyg.com/user/userWeChatRefundNotification', // 退款结果回调url
        amount: {
          refund: Math.round(userRegister.pay_money * 100),  // 退款金额，单位为分
          total: Math.round(userRegister.pay_money * 100), // 订单总金额，单位为分
          currency: 'CNY' // 货币类型
        },
        goods_detail: [
          {
            merchant_goods_id: userRegister.doctor.id.toString(), // 商户商品ID(传的是医生表的医生id)
            goods_name: `医生${userRegister.doctor.name}的挂号`, // 商品名称
            unit_price: userRegister.pay_money * 100, // 商品单价，单位为分
            refund_amount: Math.round(userRegister.pay_money * 100), // 退款金额，单位为分
            refund_quantity: 1 // 退款数量
          }
        ]
      }
      //发起退款请求
      const result: any = await this.wxpay.refund(refundRequest)
      const data = JSON.parse(result.data); // 解析JSON字符串
      if (result.status === 200) {
        userRegister.order_status = 6//退款成功
        userRegister.SystemRefundNumber = data.out_refund_no//商户退款单号
        userRegister.WeChatRefundNumber = data.refund_id//微信支付退款单号
        userRegister.remark = '退款成功',
          userRegister.refund_reason = '未就诊订单发起退款',
          userRegister.user_received_account = data.user_received_account,
          //退款时间
          userRegister.refund_time = new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai'
          });
        const userRegisters = await this.userRegisterRepository.findOne({ where: { id: userRegister.id } })
        //修改患者预约表的对应状态
        const doctorAppointment = await this.doctorAppointmentRepository.findOne({ where: { user_register: userRegisters } })
        doctorAppointment.doctor_status = 4
        await this.doctorAppointmentRepository.save(doctorAppointment); // 保存更改
        // 等待15s，在继续执行。
        await this.sleep(15000);
        //查询单笔订单的退款情况  
        await this.userRefund(data, userRegister)
        await this.userRegisterRepository.save(userRegister); // 保存更改
        //事务提交 
        await queryRunner.commitTransaction();
        return { code: 200, message: '退款成功' }
      }
      else {
        userRegister.order_status = 5,//退款失败
          userRegister.remark = '退款失败'
        //事务提交
        await queryRunner.commitTransaction();
        return { code: 403, message: data.message }
      }

    } catch (err) {
      // 如果有错误发生，回滚事务
      await queryRunner.rollbackTransaction();
      throw err; // 抛出错误
    } finally {
      // 无论如何，最后都要释放 queryRunner
      await queryRunner.release();
    }
  }
  //查询单笔退款的方法
  async userRefund(data: any, userRegister: UserRegister, retryCount = 0) {
    const results: any = await this.wxpay.getRefund(data).catch(error => {
      //捕获异常，处理Promise拒绝
      console.error('Error in refund:', error);
    });
    try {
      if (results.status === 200) {
        //查询到当前订单的退款是成功
        const data = JSON.parse(results.data); // 解析JSON字符串
        if (data.status == 'SUCCESS') {
          //给用户推送退款消息 
          await this.sendOrderRefundMessage(userRegister.user.openid, userRegister)
          //查询管理员表中启用的管理员有那些
          const admin = await this.userAdminRepository.find({
            where: {
              status: true
            }
          })
          // 定义一个for循环，遍历数组中的每个数据
          for (let i = 0; i < admin.length; i++) {
            // 获取当前数据的openid属性
            const AdminOpenid = admin[i].openid;
            //给管理员推送退款消息
            await this.sendAdminRefundMessage(AdminOpenid, userRegister);
          }
        }
        else if (retryCount < 5) { // 设置最大尝试次数为5
          //如果查询订单得到的退款状态不是SUCCESS，就重新调用自身来查询这个订单的退款情况
          setTimeout(() => {
            this.userRefund(data, userRegister, retryCount + 1)
          }, 5000); // 延迟5秒再次尝试(防止出现网络中断导致请求失败)
        }
      }
    } catch (error) {
      throw error
    }
  }

  //退款消息通知的回调接口(接受不到退款的消息通知，官方的文档的最新更新时间：2021.01.15)
  async userWeChatRefundNotification(headers: any, data: any) {
    // 第一步：检查平台证书序列号
    const serial = headers['wechatpay-serial'];
    if (serial !== process.env.WE_CHAT_SERIAL) {
      // 如果序列号不匹配，重新获取证书(用代码获取或者前往商户平台下载新的证书)
      // 目前是用官方工具(java的jar包)来下载的证书
    }
    // 第二步：获得验签字符串的数据
    const timestamp = headers['wechatpay-timestamp'];//时间戳
    const nonce = headers['wechatpay-nonce'];//随机字符串
    const signature = headers['wechatpay-signature'];//应答签名
    const body = JSON.stringify(data)
    //构造验签名串
    const message = `${timestamp}\n${nonce}\n${body}\n`;
    // 验证签名
    const signVerified = this.verifySignature(message, signature);
    if (signVerified) {
      // 签名验证成功，处理退款通知
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // 从 data 中获取 resource 字段
        const resource = data.resource;
        // 调用 decipher_gcm 方法，回调解密
        const result: any = await this.weChatPay.decipher_gcm(resource.ciphertext, resource.associated_data, resource.nonce, this.config.key);
        //退款成功
        if (result.refund_status == 'SUCCESS') {
          const userRegister = await this.userRegisterRepository.findOne({ where: { SystemNumber: result.out_trade_no } })
          userRegister.refund_time = result.success_time
          //给用户推送退款消息
          await this.sendOrderRefundMessage(userRegister.user.openid, userRegister)
          //查询管理员表中启用的管理员有那些
          const admin = await this.userAdminRepository.find({
            where: {
              status: true
            }
          })
          // 定义一个for循环，遍历数组中的每个数据
          for (let i = 0; i < admin.length; i++) {
            // 获取当前数据的openid属性
            let openid = admin[i].openid;
            //给管理员推送退款消息
            await this.sendAdminRefundMessage(openid, userRegister);
          }
          await queryRunner.commitTransaction();
          return { code: 'SUCCESS', message: '成功' };
        }
        else {
          await queryRunner.commitTransaction();
          return { code: 'FAIL', message: '失败' };
        }
      } catch (error) {
        // 如果有错误发生，回滚事务
        await queryRunner.rollbackTransaction();
        throw error; // 抛出错误
      }
      finally {
        // 无论如何，最后都要释放 queryRunner
        await queryRunner.release();
      }

    }
    else {
      // 签名验证失败，抛出错误 
      throw new Error('签名验证失败');
    }
  }
  //给用户推送退款消息
  async sendOrderRefundMessage(openid: string, userRegister: UserRegister) {
    //消息点击后，跳转到指定页面(当前医生的预约信息的手机-医生助手)
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: `${userRegister.patient_name} 申请退款成功`,
        color: '#173177'
      },
      //系统的订单号
      keyword1: {
        value: `${userRegister.SystemNumber}`,
        color: '#173177'
      },
      //退款金额
      keyword2: {
        value: `${userRegister.pay_money}元`,
        color: '#173177'
      },
      //退款途径
      keyword3: {
        value: `${userRegister.user_received_account}`,
        color: '#173177'
      },
      //退款详情
      keyword4: {
        value: `${userRegister.doctor.name}医生的挂号费
          如您需要退款中有任何问题，请咨询客服电话反馈意见和建议。有您的支持，我们会做的更好！`,
        color: '#173177'
      },
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }
  //给管理员推送退款信息
  async sendAdminRefundMessage(openid: string, userRegister: UserRegister) {
    //消息点击后，跳转到指定页面(当前医生的预约信息的手机-医生助手)
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: `${userRegister.patient_name} 申请退款成功`,
        color: '#173177'
      },
      //系统的订单号
      keyword1: {
        value: `${userRegister.SystemNumber}`,
        color: '#173177'
      },
      //退款金额
      keyword2: {
        value: `${userRegister.pay_money}元`,
        color: '#173177'
      },
      //退款途径
      keyword3: {
        value: `${userRegister.user_received_account}`,
        color: '#173177'
      },
      //退款详情
      keyword4: {
        value: `${userRegister.patient_name}—申请退款${userRegister.doctor.name}的挂号费成功`,
        color: '#173177'
      },
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }

  //待支付的订单，点击取消
  async userWeChatCancel(userRegister: UserRegister) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 更新数据
      await this.userRegisterRepository.update(userRegister.id, {
        order_status: 2,
        refund_reason: '取消未支付的订单',
        update_time: new Date().toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
        })
      });
      //把当前医生的当日挂号数量加一，总挂号数量减一
      await this.doctorService.registerNumberIncrease(userRegister.work_time, userRegister.doctor)
      //事务提交 
      await queryRunner.commitTransaction();
      return { code: 200, message: '取消成功' }
    } catch (error) {
      console.log(error)
      // 如果有错误发生，回滚事务
      await queryRunner.rollbackTransaction();
      return { code: 403, message: error }
    }
    finally {
      // 无论如何，最后都要释放 queryRunner
      await queryRunner.release();
    }
  }

  //休眠多少毫秒后再继续执行后面的代码
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  //用户查询所有已完成的订单
  async getEvaluate(openid: string) {
    //根据openid查询到用户表的id
    const users = await this.userRepository.findOne({ where: { openid: openid } })
    //查询已完成的所有订单中未评价的订单
    const wait_evaluate = await this.userRegisterRepository
      .createQueryBuilder('user_register')
      .leftJoinAndSelect('user_register.doctor', 'doctor')
      .where('user_register.userid  =:userid', { userid: users.id })
      .andWhere('user_register.order_status =:order_status', { order_status: 3 })
      .andWhere('user_register.evaluate_status =:evaluate_status', { evaluate_status: false })
      .getMany();
    //查询已完成的所有订单中已评价的订单
    const evaluated = await this.userRegisterRepository
      .createQueryBuilder('user_register')
      .leftJoinAndSelect('user_register.doctor', 'doctor')
      .where('user_register.userid  =:userid', { userid: users.id })
      .andWhere('user_register.order_status =:order_status', { order_status: 3 })
      .andWhere('user_register.evaluate_status =:evaluate_status', { evaluate_status: true })
      .getMany();
    return { wait_evaluate, evaluated }
  }

  //微信端用户评价已完成的订单
  async saveUserEvaluateRegister(userEvaluate: UserEvaluate, doctorId: number, SystemNumber: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userEvaluates = new UserEvaluate();
      userEvaluates.evaluate_name = userEvaluate.evaluate_name
      userEvaluates.doctor_name = userEvaluate.doctor_name
      userEvaluates.status = userEvaluate.status
      userEvaluates.content = userEvaluate.content
      userEvaluates.stars = userEvaluate.stars
      userEvaluates.SystemNumber = userEvaluate.SystemNumber
      userEvaluates.create_time = Math.floor(Date.now() / 1000);
      // 获取一个 Doctor 实体
      const doctor = await queryRunner.manager.findOne(Doctor, {
        where: { id: doctorId },
      });
      // 设置 UserEvaluate.doctor 属性
      userEvaluates.doctor = doctor;

      //把对应订单的待评价数据改成已评价
      const userRegister = await this.userRegisterRepository.findOne({ where: { SystemNumber: SystemNumber } })
      userRegister.evaluate_status = true
      const res_userRegister = await queryRunner.manager.save(userRegister);
      const res_userEvaluates = await queryRunner.manager.save(userEvaluates);
      await queryRunner.commitTransaction();
      if (res_userRegister && res_userEvaluates) {
        return { code: 200, message: '评价成功' };
      } else {
        return { code: 401, message: '评价失败' };
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }
  //微信端用户查看评价
  async seeUserEvaluate(SystemNumber: string) {
    const res = await this.userEvaluateRepository.findOne({ where: { SystemNumber: SystemNumber } })
    if (res) {
      return { code: 200, data: res }
    }
    return { code: 401, message: '查询评价失败' }
  }

  //微信端用户修改评价
  async changeEvaluate(userEvaluate: UserEvaluate) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const updateDate = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
      });
      const res = await queryRunner.manager.update(
        UserEvaluate,
        userEvaluate.id,
        {
          stars: userEvaluate.stars,
          content: userEvaluate.content,
          update_time: updateDate
        },
      );
      await queryRunner.commitTransaction();
      const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
      if (success) {
        return { code: 200, message: "修改成功" };
      } else {
        return { code: 401, message: "修改失败" };
      }
    } catch (err) {
      // 如果发生错误，则回滚事务
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  //每天晚上8点自动执行把已签到的患者订单，修改为就诊完成，然后给用户发送就诊完成通知，让用户评价
  /**
   * 定时任务，修改已签到的订单为就诊完成 
   * schedule(分钟{0-59}，小时{0-23}，天数{1-31}，月份{1-12}，周几{0-7(0和7都代表周日)}，*表示每个)
   */
  scheduleCronJob() {
    cron.schedule('0 20 * * *', () => {
      this.automaticUpdateUserRegisterOrderStatus();
    });
  }

  //查询已就诊的患者订单,推送完成消息推送
  async automaticUpdateUserRegisterOrderStatus() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 获取已就诊中没有推送就诊完成消息的订单
      const signedOrders = await queryRunner.manager.find(UserRegister, {
        where: {
          order_status: 3,
          end_message: false,
        },
        relations: ['doctor', 'user']
      });
      for (const order of signedOrders) {
        //给用户推送就诊完成通知
        order.end_message = true
        await this.sendUserCompleted(order.user.openid, order);
        await this.userRegisterRepository.save(order)
      }
      // 提交事务
      await queryRunner.commitTransaction();
    } catch (err) {
      // 如果出现错误，回滚事务
      console.log(err)
      await queryRunner.rollbackTransaction();
    } finally {
      // 无论成功还是失败，都需要释放查询运行器
      await queryRunner.release();
    }
  }

  //给用户推送就诊完成通知
  async sendUserCompleted(openid: string, userRegister: UserRegister) {
    let status = ''
    if (userRegister.status == 2) {
      status = '上午'
    }
    else {
      status = '下午'
    }
    //消息点击后，跳转到指定页面
    const messageUrl = '';
    // 消息模板ID
    const templateId = '';
    // 模板中各参数的赋值内容
    const data = {
      first: {
        value: `您好，您已完成本次就诊。`,
        color: '#173177'
      },
      //就诊人姓名
      keyword1: {
        value: `${userRegister.patient_name}`,
        color: '#173177'
      },
      //就诊科室
      keyword2: {
        value: `${userRegister.doctor.name}医生工作室`,
        color: '#173177'
      },
      //就诊医生
      keyword3: {
        value: `${userRegister.doctor.name}`,
        color: '#173177'
      },
      //就诊时间
      keyword4: {
        value: `${userRegister.work_time}—${status}`,
        color: '#173177'
      },
    };
    // 调用sendMessage方法
    await this.wechatService.sendMessage(openid, templateId, data, messageUrl);
  }


}

