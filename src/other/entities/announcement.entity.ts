import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//公告表
@Entity()
export class Announcement {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //公告标题
  @Column({ nullable: true})
  title: string;

  //公告内容(富文本内容)
  @Column({type:'text', nullable: true})
  content: string;

  //创建时间
  @Column({ nullable: true})
  create_time: string;

    //修改时间
    @Column({ nullable: true})
    update_time: string;
  

  //公告状态(0=下架，1=启用)
  @Column({  nullable: true})
  status: boolean;
}
