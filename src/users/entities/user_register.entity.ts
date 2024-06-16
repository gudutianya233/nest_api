import { Doctor } from 'src/doctor/entities/doctor.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PatientsCard } from './patients_card.entity';
import { DoctorAppointment } from 'src/doctor/entities/doctor_appointment.entity';
import { User } from './user.entity';

//用户订单表
@Entity()
export class UserRegister {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int'})
  id: number;
  //每一个用户订单和医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;
  //每一个用户订单和用户表的多对一关系
  @ManyToOne(() => User)
  user: User;
  //每个用户订单和就诊卡表的多对一关系
  @ManyToOne(() => PatientsCard)
  patient: PatientsCard;
  // 每一个用户订单和医生预约表的一对一关系
  @OneToOne(() => DoctorAppointment, (doctorAppointment) => doctorAppointment.user_register, {
    nullable: true,
  })
  @JoinColumn({ name: 'doctor_appointment_id' }) // 指定外键列的名称为doctor_appointment_id(只有支付成功才会生成数据)
  doctorAppointment: DoctorAppointment;
  //就诊人的名字
  @Column({ nullable: true })
  patient_name: string;
  //就诊人的号码
  @Column({ nullable: true })
  phone: string;
  //就诊人的身份证号码
  @Column({ nullable: true })
  id_number: string;
  //就诊人的挂号的日期
  @Column({ nullable: true })
  work_time: string;
  //就诊人的病情描述
  @Column({ nullable: true })
  describe: string;
  //订单是否已评价(0=未评价,1=已评价)
  @Column({ nullable: true })
  evaluate_status: boolean;
  //订单结束推送就诊完成通知(只要前台签到后才有数据，0=未推送,1=已推送)
  @Column({ nullable: true })
  end_message: boolean;
  //就诊人的挂号的时间的具体,2=上午还是3=下午
  @Column({ nullable: true })
  status: number;
  //支付的金额
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  pay_money: number;
  //支付的时间
  @Column({ nullable: true })
  pay_time: string;
  //微信订单号
  @Column({ nullable: true })
  WeChatNumber: string;
  //系统订单号
  @Column({ nullable: true })
  SystemNumber: string;
  //订单的备注
  @Column({ nullable: true })
  remark: string;
  //订单的创建时间
  @Column({ nullable: true })
  create_time: string;
  //订单的修改时间
  @Column({ nullable: true })
  update_time: string;
  //系统的退款单号
  @Column({ nullable: true })
  SystemRefundNumber: string;
  //微信支付返回的退款单号
  @Column({ nullable: true })
  WeChatRefundNumber: string;
  //订单的退款时间
  @Column({ nullable: true })
  refund_time: string;
  //订单的退款原因
  @Column({ nullable: true })
  refund_reason: string;
  //订单状态(0=待支付，1=已支付,2=支付失败(已取消)，3=已就诊(签到完成)，4=发起退款，5=退款失败,6=退款成功)
  @Column({ nullable: true })
  order_status: number;
  //订单退款的渠道
  @Column({ nullable: true })
  user_received_account: string;
}   