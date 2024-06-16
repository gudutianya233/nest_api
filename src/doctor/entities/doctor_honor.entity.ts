import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

//医生荣誉图片表
@Entity()
export class DoctorHonor {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //医生id
  //医生荣誉表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;

  //医生姓名
  @Column({ nullable: true })
  name: string;

  //荣誉图片地址
  @Column({ nullable: true })
  url: string;

  //图片上传时间
  @Column({ nullable: true })
  create_time: string;

    //修改时间
    @Column({ nullable: true })
    update_time: string;
    

  //荣誉图片类型
  @Column({ nullable: true })
   honor_type: string;

  //状态
  @Column({ nullable: true })
   status:boolean
}
