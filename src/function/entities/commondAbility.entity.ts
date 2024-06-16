import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//首页常用功能表
@Entity()
export class CommondAbility{
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //图片地址
  @Column({ nullable: true})
  url: string;

   //名称
   @Column({ nullable: true})
   name: string;
     //类型
     @Column({ nullable: true})
     type: string;
    //创建时间
  @Column({ nullable: true})
  create_time: string;
   //状态(“已发布=1”或“已下架=0”)
   @Column({ })
   status: boolean;
}