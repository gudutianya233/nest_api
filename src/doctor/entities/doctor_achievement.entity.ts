import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

//医生成就表
@Entity()
export class DoctorAchievement {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //医生id
  //医生荣誉表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;

    //医生名字
    @Column({ nullable: true })
    name: string;
    
  //成就的具体名字
  @Column({ nullable: true })
  title: string;

  //成就的创建时间
  @Column({ nullable: true })
  create_time: string;

    //修改时间
    @Column({ nullable: true })
    update_time: string;
    
    //状态
    @Column({ nullable: true })
    status:boolean
    //成就的排序
  @Column({ nullable: true })
  sort: number;
}
