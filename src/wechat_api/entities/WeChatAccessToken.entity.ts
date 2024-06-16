import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

//微信的AccessToken
@Entity()
export class WeChatAccessToken {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //token
  @Column()
  token: string;
  //创建时间
  @Column({ type: "varchar", length: 20, nullable: true })
  create_time: number

  //有效时间
  @Column({ type: "varchar", length: 10, nullable: true })
  expires_in: number

}