import {  Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { Response } from 'express';
import { Public } from 'src/middleware/JwtGuard';
import * as path from 'path'
import * as fs from 'fs'


@ApiTags('图片的文件上传')
@Controller('/')
export class UploadController {
  @ApiOperation({ summary: '上传图片' })
  @Post(':dir')
  //@UseInterceptors(FileInterceptor('file', multerConfig))
       // 使用memoryStorage作为storage选项
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage()}))
  async upload(@UploadedFile() file, @Param('dir') dir: string) {
// 获取当前日期 
const date = new Date(); 
// 格式化日期为yyyy-MM-dd 
const dateStr = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
 // 对文件名进行编码
  const filename = encodeURI(file.originalname); 
  // 拼接文件路径 
  // 使用path.resolve方法来获取绝对路径，而不是path.join 
  // 使用__dirname的上级目录作为基础路径，而不是__dirname本身 
  // 去掉多余的…符号
   const filePath = path.resolve(__dirname, '..','..', 'public', dir, dateStr,filename);
    // 检查目录是否存在，如果不存在则创建
    fs.mkdirSync(path.dirname(filePath), { recursive: true }); 
     // 将文件写入到目录中
      fs.writeFileSync(filePath, file.buffer);
     return { 
      errno: 0,
      data: {
        url: `http://localhost:5000/public/${dir}/${dateStr}/${filename}`
      }
    }
  }
  @Public()
  @ApiOperation({ summary: '读取图片' })
  @Get('public/:dir/:date/:filename')
  async getImage(
    @Param('dir') dir: string,
    @Param('date') date: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) { 
    const [year, month, day] = date.split('-');
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'public', 
      dir, 
      `${year}-${month}-${day}`,
      filename
    );
    res.sendFile(filePath);
  }

}