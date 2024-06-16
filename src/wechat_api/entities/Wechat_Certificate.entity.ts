import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

//微信的平台证书(存放的数据是未解密的数据)
@Entity()
export class WechatCertificate {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //平台的证书序列号
  @Column({ length: 500 })
  serial_no: string;

  //证书启用时间
  @Column('text')
  effective_time: string;

  //证书弃用时间
  @Column('text')
  expire_time: string;

  //加密证书的算法
  @Column('text')
  algorithm: string;

  //加密证书的随机串
  @Column('text')
  nonce: string;

  //加密证书的附加数据
  @Column('text')
  associated_data: string;

  //加密后的证书内容
  @Column('text')
  ciphertext: string;

  //创建时间
  @Column({ type: "varchar", length: 20, nullable: true })
  create_time: string

    //修改时间
    @Column({ type: "varchar", length: 20, nullable: true })
    update_time: string
  

}