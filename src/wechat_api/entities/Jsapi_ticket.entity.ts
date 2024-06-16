import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

//js-sdk用来生成JS-SDK权限验证的签名
@Entity()
export class JsapiTicket {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //token
  @Column()
  Jsapi_ticket: string;
  //创建时间
  @Column({ type: "varchar", length: 20, nullable: true })
  create_time: number

  //有效时间
  @Column({ type: "varchar", length: 10, nullable: true })
  expires_in: number

}