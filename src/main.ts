import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { AllExceptionsFilter } from './filter/ExceptionsFilter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());//异常日志
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
