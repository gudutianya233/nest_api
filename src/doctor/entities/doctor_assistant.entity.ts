import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

//医生助手信息表
@Entity()
export class DoctorAssistant {
    //自增列
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;
    //助手的唯一标识
    @Column({ nullable: true })
    openid: string;
    //将公众号绑定到微信开放平台账号后(关注动作)，才会出现该字段。
    @Column({ nullable: true })
    unionid: string;
      //助手微信名称
      @Column({ nullable: true })
      nickname: string;
    //助手名字
    @Column({ nullable: true })
    name: string;
    
    //医生表的多对一关系
    @ManyToOne(() => Doctor)
    doctor: Doctor;
    //状态
    @Column({ nullable: true })
    status: boolean;
    //联系电话
    @Column({ nullable: true })
    number: string;
    //角色类型
    @Column({ nullable: true })
    role: string;
    //创建时间
    @Column({ nullable: true })
    create_time: string;
    //修改时间
    @Column({ nullable: true })
    update_time: string;
}