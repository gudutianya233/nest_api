import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//微信端的管理员表
@Entity()
export class UserAdmin {
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //用户的唯一标识
  @Column({ nullable: true })
  openid: string;

  //只有在用户将公众号绑定到微信开放平台账号后(关注动作)，才会出现该字段。
  @Column({ nullable: true })
  unionid: string;
  
  //用户昵称
  @Column()
  nickname: string;

  //普通用户个人资料填写的城市
  @Column({ nullable: true })
  city: string;

  //用户个人资料填写的省份
  @Column({ nullable: true })
  province: string;

  //国家
  @Column({ nullable: true })
  country: string;

  //用户头像
  @Column({ nullable: true })
  headimgurl: string;
  //最后一次授权时间
  @Column({  nullable: true })
  authorize_time: string;
   //创建时间
   @Column({  nullable: true })
   create_time: string;
      //创建时间
      @Column({  nullable: true })
      update_time: string; 
      //状态
      @Column({  nullable: true })
      status: boolean; 
}
