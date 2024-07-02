import { MiddlewareConsumer,Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import{ConfigModule}from '@nestjs/config'
import { WeChatModule } from './wechat_api/wechat.module';
import { AuthModule } from './auth/auth.module';
import { SwiperImageModule } from './swiper-image/swiperImage.module';
import { DoctorModule } from './doctor/doctor.module';
import { HospitalModule } from './hospital/hospital.module';
import { UploadModule } from './upload/upload.module';
import { FunctionModule } from './function/function.module';
import { OtherModule } from './other/other.module';
import { JwtModules } from './jwt/jwt.modules';
import { MailModule } from './mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './middleware/JwtGuard';//路由守卫
import { ThrottlerModule } from '@nestjs/throttler';//路由进行全局的速率限制。每个客户端（基于IP地址）
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "", //数据库类型
      username: '', //账号
      password: '', //密码
      host: '', //host
      port: 3306, //
      database: "", //库名
      entities: [__dirname + '/**/*.entity{.ts,.js}'], //实体文件
      synchronize:true, //synchronize字段代表是否自动将实体类同步到数据库(开发时打开，部署时关闭)
      retryDelay:500, //重试连接数据库间隔
      retryAttempts:10,//重试连接数据库的次数
      autoLoadEntities:true, //如果为true,将自动加载实体 forFeature()方法注册的每个实体都将自动添加到配置对象的实体数组中
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ 
        ttl: 60, // 时间窗口的长度（以秒为单位）
        limit: 60,// 在一个时间窗口内允许的最大请求次数
      }],
    }),
    ConfigModule.forRoot({
      isGlobal:true
    }),
    MailModule,
    JwtModules,
    UsersModule,
    AuthModule,
    WeChatModule,
    OtherModule,
   SwiperImageModule,
   DoctorModule,
   HospitalModule,
   UploadModule,
   FunctionModule,
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide: APP_GUARD,
    useClass: JwtGuard,
  },],
})
 export class AppModule {}
 