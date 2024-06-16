import { Doctor } from 'src/doctor/entities/doctor.entity';
import { PatientsCard } from 'src/users/entities/patients_card.entity';
import { UserRegister } from 'src/users/entities/user_register.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';


//用户支付成功后的医生预约表
@Entity()
export class DoctorAppointment {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
  //每一个用户订单和医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;
  //每个用户订单和就诊卡表的多对一关系
  @ManyToOne(() => PatientsCard)
  patient: PatientsCard;
  //每一个医生预约和用户订单表的一对一关系
  @OneToOne(() => UserRegister)
  @JoinColumn({ name: 'user_register_id' }) // 指定外键列的名称为user_register_id
  user_register: UserRegister;
  //就诊人的名字
  @Column({ nullable: true })
  patient_name: string;
  //就诊人的电话号码
  @Column({ nullable: true })
  phone: string;
  //就诊人的挂号的日期
  @Column({ nullable: true })
  work_time: string;
  //就诊人的挂号的具体时间,2=上午还是3=下午
  @Column({ nullable: true })
  status: number;
  //预约的创建时间
  @Column({ nullable: true })
  create_time: string;
  //预约的修改时间
  @Column({ nullable: true })
  update_time: string;
  //就诊状态(0=待就诊(已支付，未签到)，1=签到成功(等待就诊)，2=就诊完成,3=发起退款,4=退款成功,5=未就诊)
  @Column({ nullable: true })
  doctor_status: number;
} 