import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';

//用户的关注表
@Entity()
export class UserFollow {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //用户的唯一标识
  @Column({ nullable: true })
  openid: string;

  //用户表的多对一关系
  @ManyToOne(() => User)
  user: User;
  
   //用户的名字
  @Column({ nullable: true })
  user_name: string;

  //医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;
 //医生的名字
 @Column({ nullable: true })
 doctor_name: string;
   //用户关注时间
   @Column({ nullable: true })
   follow_time: string;
}
