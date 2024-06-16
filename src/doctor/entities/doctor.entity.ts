import { Column, Entity,  PrimaryGeneratedColumn } from 'typeorm';

//医生表
@Entity()
export class Doctor {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //医生名字
  @Column({ nullable: true })
  name: string;

  //医生头衔
  @Column({ nullable: true })
  title: string;
  //医生的排序信息
  @Column({ nullable: true })
  doctor_sort: number;

  //医生头像url地址
  @Column({ nullable: true })
  head__picture: string;

  //原价挂号费
  @Column({ type: 'decimal', precision: 5, scale: 2 ,nullable: true } )
  original_registration_cost: number;

  //现价挂号费
  @Column({ type: 'decimal', precision: 5, scale: 2 ,nullable: true } )
  registration_cost: number;

  //关注数量
  @Column({ nullable: true })
  attention: number;

  //挂号量
  @Column({ nullable: true })
  receive_number: number;

  //好评率
  @Column({ nullable: true })
  favorable_rate: number;

  //医生状态(是否坐诊)
  @Column({ nullable: true })
  switch: boolean;

  //医生简介
  @Column({type: 'text', nullable: true })
  overview_content: string;

  //医生信息的创建人
  @Column({ nullable: true })
  create_staff: string;

  //创建时间
  @Column({ nullable: true })
  create_time: string;
}