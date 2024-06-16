import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
//就诊卡表
@Entity()
export class PatientsCard {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //每一个评价的用户表的多对一关系
  @ManyToOne(() => User)
  user: User;
  //就诊人名字
  @Column({ nullable: true })
  name: string;
  //电话号码
  @Column({ nullable: true })
  phone: string;
  //年龄
  @Column({ nullable: true })
  age: number;
  //性别(1=男，0=女)
  @Column({ nullable: true })
  sex: boolean;
  //绑定的证件类型(0=身份证,1=其他)
  @Column({ nullable: true })
  id_type: boolean;
  //绑定的证件号码
  @Column({ nullable: true })
  id_number: string;
    //是否是复诊患者
    @Column({ nullable: true })
    repeat_patient: boolean;
  //创建时间
  @Column({ nullable: true })
  create_time: string;
  //修改时间
  @Column({ nullable: true })
  update_time: string;
}