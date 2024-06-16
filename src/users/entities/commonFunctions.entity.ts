import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//用户常用功能表
@Entity()
export class CommonFunctions{
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //功能名字
  @Column({ nullable: true })
  name: string;

  //功能图标
  @Column({ nullable: true })
  iconUrl: string;
  
  //功能类型
  @Column({ nullable: true })
  type: string;
   //创建时间
   @Column({ nullable: true })
  create_time: string;
 //修改时间
 @Column({ nullable: true })
 update_time: string;
  //功能状态(是否启用)
  @Column({ nullable: true })
  status: boolean;
}