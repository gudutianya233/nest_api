import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//运维系统的账号表
@Entity()
export class SystemUser{
  //自增列
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  //名字
  @Column({ nullable: true })
  name: string;

  //登录的账号
  @Column({ nullable: true })
  account: string;
  
  //密码
  @Column({ nullable: true })
  password: string;
    
    //密码盐
    @Column({ nullable: true })
    salt: string;
  //权限(0=普通账号，1=管理员账号)
  @Column({ nullable: true })
  roles: number;
   
   //创建时间 
   @Column({ nullable: true })
  create_time: string;

 //修改时间
 @Column({ nullable: true })
 update_time: string;

}