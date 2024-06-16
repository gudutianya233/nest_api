import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from '../../doctor/entities/doctor.entity';


//医生评价表
@Entity()
export class UserEvaluate {
    //自增列
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;
    //每一个评价的医生表的多对一关系
    @ManyToOne(() => Doctor)
    doctor: Doctor;
    //系统订单号
    @Column({ nullable: true })
    SystemNumber: string;
    //医生名字
    @Column({ nullable: true })
    doctor_name: string;
    //评价星星数量(1-5)
    @Column({ nullable: true })
    stars: number;
    //评价人的名字(就诊人)
    @Column({ nullable: true })
    evaluate_name: string;
    //评价内容
    @Column({ type: 'text', nullable: true })
    content: string;
    //评价的创建时间
    @Column({ nullable: true })
    create_time: number;
    //修改时间
    @Column({ nullable: true })
    update_time: string;
    //状态
    @Column({ nullable: true })
    status: boolean;
}