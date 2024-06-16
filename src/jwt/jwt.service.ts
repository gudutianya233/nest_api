import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { SystemUser } from 'src/users/entities/system_user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class JwtService {
    //公钥
    private certPath = path.join(__dirname, '..', '..',  process.env.LOGIN_CERT)
    private cert = fs.readFileSync(this.certPath, 'utf8');
    //私钥
    private keyPath = path.join(__dirname, '..', '..',  process.env.LOGIN_KEY);
    private privateKey = fs.readFileSync(this.keyPath, 'utf8');
  constructor
  (
    @Inject('CRYPTO') private readonly crypto: any,
    @InjectRepository(SystemUser)
    private usersRepository: Repository<SystemUser>,
  ) {}

// 生成令牌
async signToken(payload: any, expiresIn: number): Promise<string> {
  // 在payload中添加过期时间属性
  payload.exp = Math.floor(Date.now() / 1000) + expiresIn;
  // 将payload对象转换为JSON字符串
  const payloadString = JSON.stringify(payload);
  // 使用私钥对payload进行签名，得到一个base64编码的签名字符串
  const signature = this.crypto
    .sign('sha256', Buffer.from(payloadString), {
      key: this.privateKey,
      padding: this.crypto.constants.RSA_PKCS1_PSS_PADDING,
    })
    .toString('base64');
  // 将payload和签名拼接起来，得到一个JWT格式的令牌
  const token = payloadString + '.' + signature;
  return token;
}
// 验证令牌
async verifyToken(token: string): Promise<boolean | any> {
  //将令牌分割为payload和签名两部分
  const [payloadString, signature] = token.split('.');
  // 使用公钥对令牌进行验证，得到一个布尔值，表示是否有效
  const verify = this.crypto.verify(
    'sha256', 
    Buffer.from(payloadString),
    { 
      key: this.cert,
      padding: this.crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    Buffer.from(signature, 'base64'),
  );
  // 如果验证失败，返回false
  if (!verify) {
   return false
  }
  // 如果验证成功，解析payload并返回
  const payload = JSON.parse(payloadString);
  return payload;
} 
//验证登录用户的密码是否正确
async validateUser(account:string,password:string){
  const user = await this.usersRepository.findOne({
    where:{
        account: account
   }  
});
if(user){
  // 使用盐来哈希用户输入的密码
  const hash =  this.crypto.createHash('sha256');
  hash.update(password + user.salt);
  const hashedInputPassword = hash.digest('hex');
  // 比较哈希后的输入密码和数据库中存储的哈希密码
  if(user.password==hashedInputPassword){
    return {code:200,user} 
  }
  else{
    return{code:402,message:'密码错误'}
  }
}
return {code:402,message:'用户不存在'}
}
}  