import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

//医生擅长治疗表
@Entity()
export class DoctorProficientTreatment {
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

  //科目名字
  @Column({ nullable: true })
  subjects: string;

  //擅长治疗的具体病症
  @Column({ type: 'text', nullable: true })
  proficient_treatment: string;

  //创建时间
  @Column({ nullable: true })
  create_time: string;

    //修改时间
    @Column({ nullable: true })
    update_time: string;
    
  //状态
  @Column({ nullable: true })
  status:boolean;
}
