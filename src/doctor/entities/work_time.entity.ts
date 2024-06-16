import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DoctorWork } from './doctor_work.entity';
import { Doctor } from './doctor.entity';


//医生出诊具体时间表
@Entity()
export class WorkTime {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
  //出诊时间表和医生表的多对一关系
  @ManyToOne(() => Doctor)
  doctor: Doctor;
    //医生名字
    @Column({ nullable: true })
    name: string;
  //具体的出诊时间和排班安排表的多对一关系
  @ManyToOne(() => DoctorWork)
  doctorWork: DoctorWork;
    //出诊时间(yyyy-mm-dd)
    @Column({ nullable: true })
   work_time: string;
  //创建时间
  @Column({ nullable: true })
  create_time: string;
    //修改时间
    @Column({ nullable: true })
    update_time: string;
  //出诊情况(0=休息，1=全天，2=上午，3=下午)
  @Column({ nullable: true })
  status:number
    //当日当前医生剩余号数
    @Column({ nullable: true })
  register_number:number
}