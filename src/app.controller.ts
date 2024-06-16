import { Controller, Get, Post,Body } from '@nestjs/common';
import { AppService } from './app.service';
import {ApiOperation, ApiTags} from '@nestjs/swagger'

@Controller()
@ApiTags('默认')
export class AppController {
  constructor() {}
  @Get()
  @ApiOperation({summary:'御生堂互联网医院主页'})
  getHello(): string {
    return process.env.APP_HOME
   // return this.appService.getHello();
  }
}
