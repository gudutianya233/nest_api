import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//首页轮播图表
@Entity()
export class SwiperImage {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //图片地址
  @Column({ nullable: true})
  url: string;

   //图片名称
   @Column({ nullable: true})
   name: string;

  //创建时间
  @Column({ nullable: true})
  create_time: string;


  //图片状态(“已发布=1”或“已下架=0”)
  @Column({ })
  status: boolean;
}
