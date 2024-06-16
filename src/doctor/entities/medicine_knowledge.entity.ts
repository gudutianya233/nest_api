import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

//医生中医小知识表
@Entity()
export class MedicineKnowledge {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //每一篇知识关联的医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;

  //标题
  @Column({ type: 'text', nullable: true })
  title: string;

  //内容
  @Column({ type: 'text', nullable: true })
  content: string;

  //封面图片
  @Column({ nullable: true })
  cover_image: string;

  //状态
  @Column({ nullable: true })
  isSwitch: boolean;

  //阅读量
  @Column({ nullable: true })
  read_number: number;

  //点赞量
  @Column({ nullable: true })
  like_number: number;

  //创建时间
  @Column({ nullable: true })
  create_time: string;

}
