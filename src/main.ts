import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { AllExceptionsFilter } from './filter/ExceptionsFilter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
//配置跨域
app.enableCors({
  //允许请求接口的网站，其他网站的请求将会被CORS策略阻止
   origin: ['http://365bzt.bztzyg.com', 'http://wap.bztzyg.com','http://4g.bztzyg.com','http://localhost:4000',
    'http://365bztmanage.bztzyg.com','http://complaint.bztzyg.com','http://localhost:6000','http://9e7chd.natappfree.cc'],
    allowedHeaders: 'Content-Type, Accept,Authorization,X-CSRF-Token,Access-Control-Allow-Origin',
  // methods: '*',
}); 
  //helmet是配置CSP（内容安全策略），用于检测并削弱某些特定类型的攻击
//   app.use(helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'", "http://365bztm.bztzyg.com", "http://365bzt.bztzyg.com", "http://complaint.bztzyg.com",
//          "http://365bztmanage.bztzyg.com", 'http://wap.bztzyg.com','http://4g.bztzyg.com',"http://8n36wr.natappfree.cc",'http://localhost:4000'],
//         styleSrc: ["'self'", "'unsafe-inline'", "http://365bztm.bztzyg.com", "http://365bzt.bztzyg.com", "http://complaint.bztzyg.com",
//          "http://365bztmanage.bztzyg.com", 'http://wap.bztzyg.com','http://4g.bztzyg.com',"http://8n36wr.natappfree.cc",'http://localhost:4000'],
//         imgSrc: ["'self'", "data:", "http://365bztm.bztzyg.com", "http://365bzt.bztzyg.com", "http://complaint.bztzyg.com", 
//         "http://365bztmanage.bztzyg.com", 'http://wap.bztzyg.com','http://4g.bztzyg.com',"http://8n36wr.natappfree.cc",'http://localhost:4000'],
//       },
//     },
//   }))
//   app.use((req, res, next) => {
//   const allowedOrigins = ["http://365mbztzyg.com", "http://365bzt.bztzyg.com", "http://complaint.bztzyg.com",
//     "http://365bztmanage.bztzyg.com", 'http://wap.bztzyg.com','http://4g.bztzyg.com',"http://8n36wr.natappfree.cc",'http://localhost:4000'];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   } else {
//     res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
//   }
//   next();
// });

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Swagger 接口文档')
  .setDescription('挂号系统后台api接口')
  .setVersion('1.0')
  .build();
  //http://localhost/端口号/api-docs  swagger地址
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api-docs', app, document);
  await app.listen(3000);
}
config();
bootstrap();
