import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';


//医生出诊时间安排表
@Entity()
export class DoctorWork {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
  //每一个出诊时间的医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;
  //医生名字
  @Column({ nullable: true })
  name: string;
   //出诊的具体时间{status表示出诊时间(0=当天未出诊,1=全天，2=上午，3=下午)，date表示日期(周一到周日)}
  @Column('text')
  work:string;
  //创建时间
  @Column({ nullable: true })
  create_time: string;
    //修改时间
    @Column({ nullable: true })
    update_time: string;
}
export class Work{
    status: number;//出诊时间(0=当天未出诊,1=全天，2=上午，3=下午)
    date: number;//日期(周一到周日)
    register_number:number;  //当日当前医生剩余号数
}