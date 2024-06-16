import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { WeChatAccessToken } from './entities/WeChatAccessToken.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { JsapiTicket } from './entities/Jsapi_ticket.entity';
import * as fs from 'fs';
import * as path from 'path';
import { WechatCertificate } from './entities/Wechat_Certificate.entity';


@Injectable()
export class WechatApiService {
    // 定义一些微信支付的配置信息，如商户号、密钥、证书等
    private readonly config = {
        appid: process.env.APP_ID,
        mch_id: process.env.MCH_ID,
        key: process.env.KEY,
        pfx_key: process.env.PEF_URL_KEY,
        pfx_cert: process.env.PEF_URL_CERT,
    };
    //公钥
    private certPath = path.join(__dirname, '..', '..', this.config.pfx_cert)
    private cert = fs.readFileSync(this.certPath, 'utf8');
    //私钥
    private keyPath = path.join(__dirname, '..', '..', this.config.pfx_key);
    private privateKey = fs.readFileSync(this.keyPath, 'utf8');
    constructor(
        private readonly httpService: HttpService,
        //微信的AccessToken
        @InjectRepository(WeChatAccessToken)
        private readonly accessTokenRepository: Repository<WeChatAccessToken>,
        //js-sdk用来生成JS-SDK权限验证的签名
        @InjectRepository(JsapiTicket)
        private readonly jsapiTicketRepository: Repository<JsapiTicket>,
        //微信的平台证书
        @InjectRepository(WechatCertificate)
        private readonly wechatCertificateRepository: Repository<WechatCertificate>,


    ) {
        //项目启动先调用获取到AccessToken,JsapiTicket,WechatCertificate
         this.getStableAccessToken();
         this.getWechatPayParamJsapi_ticket();
        // this.checkPlatformCertificateValidity();

        //至少每5分钟发起一次调用，查询AccessToken的有效时间是否低于300，低于300则重新获取
        setInterval(() => this.updateAccessToken(), 5 * 60 * 1000);
        //每小时去查询一次是否有已经过期的token，清除
        setInterval(() => this.clearExpiredAccessTokens(), 60 * 60 * 1000);
          //至少每5分钟发起一次调用，查询Jsapi_ticket的有效时间是否低于300，低于300则重新获取
          setInterval(() => this.updateJsapi_ticket(), 5 * 60 * 1000); 
          //每小时去查询一次是否有已经过期的Jsapi_ticket，清除
          setInterval(() => this.clearExpiredJsapi_ticket(), 60 * 60 * 1000);
    }
    //验证服务器
    verifySignature(
        signature: string,
        timestamp: string,
        nonce: string): boolean {

        const token: string = 'qweasdzxc123'
        // 1）将token、timestamp、nonce三个参数进行字典序排序
        const stringArray = [timestamp, nonce, token]
        const resultArray = stringArray.sort()
        //  console.log("排序后的字典===>",resultArray)
        //将字典转换成字符串
        const resultString = resultArray.join('')
        //      console.log("将字典转换成字符串g===>",resultString)
        //sha1加密
        const shaResult = crypto.createHash('sha1').update(resultString).digest('hex');

        //  console.log("本地sha1加密后的字符串===>",shaResult)

        //微信返回的sha1加密
        //  console.log("微信返回的sha1加密===>",signature)

        return shaResult === signature;
    }


    //获取AccessToken(测试环境使用)
    async getAccessToken(): Promise<void> {
        const appId = process.env.APP_ID;
        const appSecret = process.env.APP_SECRET;
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
        const response$ = this.httpService.get(url)
        const response = await firstValueFrom(response$);
        const data = response.data;
        const accessToken = new WeChatAccessToken();
        accessToken.token = data.access_token;
        accessToken.create_time = new Date().getTime();
        accessToken.expires_in = data.expires_in
        await this.accessTokenRepository.save(accessToken);
    }

    //获取AccessToken(正式上线环境使用)
    async getStableAccessToken(): Promise<string> {
        const appid: string = process.env.APP_ID;
        const secret: string = process.env.APP_SECRET;
        const force_refresh: boolean = false
        const url = 'https://api.weixin.qq.com/cgi-bin/stable_token'
        const response$ = await this.httpService
            .post(url, {
                grant_type: 'client_credential',
                appid,
                secret,
                force_refresh
            })
        const response = await firstValueFrom(response$);
        const data = response.data;
        // console.log('getStableAccessToken',data)
        const token = data.access_token;
        const AccessToken = await this.accessTokenRepository.findOne({ where: { token } })
        if (!AccessToken) {
            const accessToken = new WeChatAccessToken();
            accessToken.token = data.access_token;
            accessToken.create_time = new Date().getTime();
            accessToken.expires_in = data.expires_in
            await this.accessTokenRepository.save(accessToken);
        }
        return token
    }
 
    //更新AccessToken
    async updateAccessToken() {
        const appid = process.env.APP_ID;
        const secret = process.env.APP_SECRET;
        const force_refresh = false;
        const url = 'https://api.weixin.qq.com/cgi-bin/stable_token';
        const response$ = await this.httpService.post(url, {
            grant_type: 'client_credential',
            appid,
            secret,
            force_refresh
        });
        const response = await firstValueFrom(response$);
        const data = response.data;
        //  console.log('updateAccessToken',data)
        const token = data.access_token;
        const AccessToken = await this.accessTokenRepository.findOne({ where: { token } })
        // console.log('数据库查询数据',AccessToken)
        if (AccessToken) {
            if (data.expires_in < 300) {
                AccessToken.token = data.access_token;
                AccessToken.create_time = new Date().getTime();
                AccessToken.expires_in = data.expires_in;
                await this.accessTokenRepository.save(AccessToken);
            }
 
        } else {
            const newAccessToken = new WeChatAccessToken();
            newAccessToken.token = data.access_token;
            newAccessToken.create_time = new Date().getTime();
            newAccessToken.expires_in = data.expires_in;
            await this.accessTokenRepository.save(newAccessToken);
        }

    }

    //清除已经过期的AccessToken
    //首先计算出两个小时之前的时间戳，然后使用该时间戳作为查询条件，删除所有create_time字段小于该时间戳的记录
    async clearExpiredAccessTokens() {
        const now = new Date().getTime();
        const twoHoursAgo = now - 2 * 60 * 60 * 1000;
        await this.accessTokenRepository.createQueryBuilder()
            .delete()
            .where('create_time < :twoHoursAgo', { twoHoursAgo })
            .execute();
    }

    //获得微信的jsApi支付的参数jsapi_ticket
    async getWechatPayParamJsapi_ticket() {
        const AccessTokens = await this.accessTokenRepository.createQueryBuilder('accessToken')
            .orderBy('accessToken.create_time', 'DESC')
            .getOne();
        if (AccessTokens) {
            const AccessToken = AccessTokens.token
            const ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${AccessToken}&type=jsapi`;
            const response$ = this.httpService.get(ticketUrl)
            const response = await firstValueFrom(response$);
            const data = response.data;
            const Jsapi_ticket = data.ticket
            const Jsapi_tickets = await this.jsapiTicketRepository.findOne({ where: { Jsapi_ticket } })
            if (!Jsapi_tickets) {
                const jsapi_icket = new JsapiTicket();
                jsapi_icket.Jsapi_ticket = data.ticket;
                jsapi_icket.create_time = new Date().getTime();
                jsapi_icket.expires_in = data.expires_in
                await this.jsapiTicketRepository.save(jsapi_icket);
            }
            return Jsapi_ticket
        }
    }

    //更新Jsapi_ticket
    async updateJsapi_ticket() {
        const AccessTokens = await this.accessTokenRepository.createQueryBuilder('accessToken')
            .orderBy('accessToken.create_time', 'DESC')
            .getOne();
        const AccessToken = AccessTokens.token
        const ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${AccessToken}&type=jsapi`;
        const response$ = this.httpService.get(ticketUrl)
        const response = await firstValueFrom(response$);
        const data = response.data;
        const Jsapi_ticket = data.Jsapi_ticket;
        const Jsapi_tickets = await this.jsapiTicketRepository.findOne({ where: { Jsapi_ticket } })
        // console.log('数据库查询数据',Jsapi_ticket)
        if (Jsapi_tickets) {
            if (data.expires_in < 300) {
                Jsapi_tickets.Jsapi_ticket = data.ticket;
                Jsapi_tickets.create_time = new Date().getTime();
                Jsapi_tickets.expires_in = data.expires_in;
                await this.jsapiTicketRepository.save(Jsapi_tickets);
            }

        } else {
            const newJsapi_ticket = new JsapiTicket();
            newJsapi_ticket.Jsapi_ticket = data.ticket;
            newJsapi_ticket.create_time = new Date().getTime();
            newJsapi_ticket.expires_in = data.expires_in;
            await this.jsapiTicketRepository.save(newJsapi_ticket);
        }

    }

    //清除已经过期的Jsapi_ticket
    //首先计算出两个小时之前的时间戳，然后使用该时间戳作为查询条件，删除所有create_time字段小于该时间戳的记录
    async clearExpiredJsapi_ticket() {
        const now = new Date().getTime();
        const twoHoursAgo = now - 2 * 60 * 60 * 1000;
        await this.jsapiTicketRepository.createQueryBuilder()
            .delete()
            .where('create_time < :twoHoursAgo', { twoHoursAgo })
            .execute();
    }


    // 定义一个函数来检查平台证书有效期
    async checkPlatformCertificateValidity() {
        // 获取当前时间（UTC格式）
        const currentTime = new Date().toUTCString();
        // 从数据库中获取平台证书
        const platformCertificate = await this.getPlatformCertificateFromDB();
        // 检查平台证书是否为空或未定义
        if (platformCertificate == null) {
            //数据库中没有查到平台证书
            //调用平台证书下载API
            await this.getWechatPaySerial();
        }
        // 获取平台证书的过期时间
        const expireTime = platformCertificate.expire_time;
        // 比较当前时间和过期时间
        if (currentTime >= expireTime) {
            // 调用平台证书下载API
            this.getWechatPaySerial();
        } else {
            // 记录成功信息并返回
            console.log("平台证书有效");
            return;
        }
    }

    // 定义一个函数来从数据库中获取平台证书
    async getPlatformCertificateFromDB() {
        // 查询平台证书表
        // 返回最新的平台证书或者空值（如果没有找到）
        const data = this.wechatCertificateRepository.createQueryBuilder('wechat_certificate')
            .orderBy('wechat_certificate.create_time', 'DESC')
            .getOne();
        return data
    }

    // 定义一个函数来调用平台证书下载API
    async getWechatPaySerial() {
        // 根据API文档生成请求头和请求体
        // 发送GET请求到API端点并处理响应
        // 使用商户APIv3密钥解密加密的平台证书 
        // 获取解密后的平台证书的序列号
        // 根据API文档生成请求头和请求体
        const url = 'https://api.mch.weixin.qq.com/v3/certificates';
        const mchId = this.config.mch_id;
        const timestamp = Math.floor(Date.now() / 1000);
        const serial = process.env.SERIAL//商户证书序列号
        const nonce = crypto.randomBytes(16).toString('hex');
        const body = '';
        const signMessage = `GET\n/v3/certificates\n${timestamp}\n${nonce}\n${body}\n`;
        const sign = crypto.createSign('RSA-SHA256').update(signMessage).sign(this.privateKey, 'base64');
        const headers = {
            Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",serial_no=${serial},nonce_str="${nonce}",timestamp="${timestamp}",signature="${sign}"`,
            Accept: 'application/json',
            'User-Agent': process.env.User_Agent,
        }
        // 发送GET请求到API端点并处理响应
        const response$ = this.httpService.get(url,
            { headers: headers }
        );
        const response = await lastValueFrom(response$);
        const data = response.data
        // 使用商户APIv3密钥解密加密的平台证书
        //const encryptCertificate = data.encrypt_certificate;
        const ciphertext = data.ciphertext;//Base64编码后的密文
        const associatedData = data.associated_data;//附加数据包（可能为空）
        const nonces = data.nonce;//加密的随机字符串
        const algorithm = data.algorithm;//加密算法
        const Key = this.config.key;//v3的密钥
        // 调用解密方法，并捕获异常
        try {
            //解密
            const decryptedCertificate: any = this.decrypt(ciphertext, associatedData, nonces, algorithm, Key);
            if (decryptedCertificate != null) {
                // 获取解密后的平台证书的序列号
                const serialNo = decryptedCertificate.serial_no;
                // 从数据库中查询是否已经存在相同的证书序列号
                const existingCertificate = await this.wechatCertificateRepository.findOne({ where: { serial_no: serialNo } });
                // 判断是否存在相同的证书序列号
                if (existingCertificate) {
                    // 记录成功信息并返回
                    console.log("平台证书已在数据库中，无需更新");
                    return;
                } else {
                    // 将解密后的平台证书保存到数据库
                    const WechatCertificates = new WechatCertificate()
                    WechatCertificates.serial_no = serialNo
                    WechatCertificates.effective_time = data.effective_time
                    WechatCertificates.expire_time = data.expire_time
                    WechatCertificates.algorithm = algorithm
                    WechatCertificates.nonce = nonce
                    WechatCertificates.associated_data = associatedData
                    WechatCertificates.ciphertext = ciphertext
                    WechatCertificates.create_time = new Date().toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai'
                    });
                    await this.wechatCertificateRepository.save(WechatCertificates)
                }
            }
            else {
                // 解密失败，记录错误信息并上报
                console.error("解密平台证书失败");
            }
        }
        catch (e) {
            console.error(e)
        }
    }
    //解密方法
    decrypt(ciphertext, associatedData, nonce, algorithm, Key) {
        // 使用aes-256-gcm算法和商户APIv3密钥进行解密
        // 创建一个解密器对象
        const decipher = crypto.createDecipheriv(algorithm, Key, nonce);
        // 设置关联数据
        decipher.setAAD(Buffer.from(associatedData));
        // 设置认证标签
        decipher.setAuthTag(Buffer.from(ciphertext, 'base64').slice(-16));
        // 解密密文
        let decrypted;
        try {
            decrypted = decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()
        } catch (error) {
            // 处理解密错误
            console.error(error);
            return null;
        }
        // 处理解密后的明文数据
        const decryptedData = JSON.parse(decrypted);
        // 对解密后的数据进行进一步处理
        // 返回解密后的数据或者空值（如果解密失败）
        try {
            return decryptedData;
        } catch (error) {
            return null;
        }
    }

    //模板消息推送
    async sendMessage(openid: string, templateId: string, data: any,messageUrl:string) {
        const accessToken = await this.accessTokenRepository.createQueryBuilder('accessToken')
            .orderBy('accessToken.create_time', 'DESC')
            .getOne();
        // 定义微信公众号的接口地址
        const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken.token}`;
        // 定义请求体，包含消息模板ID，用户的openid和模板中各参数的赋值内容
        const body = {
            touser: openid,//推送的用户的openid
            template_id: templateId,//模板id
            url:messageUrl , // 推送的消息点击后，跳转的网页地址
            data: data//模板消息的数据
        };
        // 使用axios库来发送一个POST请求
        try {
            // 发送请求，并获取响应结果
            const response$ = this.httpService.post(url, body);
            const response = await lastValueFrom(response$);
            // 如果响应结果中的errcode为0，表示发送成功 
            if (response.data.errcode == 0) {
                // 打印日志信息
              //  console.log('消息推送成功') 
            } else {
                // 如果响应结果中的errcode不为0，表示发送失败，抛出异常
                throw new Error(response.data.errmsg);
            }
        } catch (error) {
            // 捕获异常，并打印错误信息
           // console.error(`Send template message to ${openid} failed: ${error.message}`);
        }

    } 
}


