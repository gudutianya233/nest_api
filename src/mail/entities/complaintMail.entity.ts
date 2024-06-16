import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//发起投诉的表
@Entity()
export class ComplaintMail{
 //自增列
 @PrimaryGeneratedColumn({ type: 'int' })
 id: number;

 //投诉标题
 @Column({ nullable: true })
 title:string

  //投诉内容
  @Column('text')
  content:string

   //联系电话
 @Column({ nullable: true })
 phone:string
 
   //创建时间
 @Column({ nullable: true })
  create_time:string
}