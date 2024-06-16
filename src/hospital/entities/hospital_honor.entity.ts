import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//医馆荣誉图片表
@Entity()
export class HospitalHonor {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //荣誉图片地址
  @Column({ nullable: true })
  url: string;

  //图片上传时间
  @Column({ nullable: true })
  create_time: string;

    //图片名称
    @Column({ nullable: true })
    name: string;

//图片的状态
@Column({ nullable: true })
  status:boolean;

  //类型
  @Column({ nullable: true })
 type: string;
}
