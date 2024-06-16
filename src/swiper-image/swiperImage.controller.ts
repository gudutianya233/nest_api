import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwiperImageService } from './swiperImage.service';
import { SwiperImage } from './entities/swiperImage.entity';

@ApiTags('轮播图相关操作')
@Controller('swiperImage')
export class SwiperImageController {
    constructor(private readonly swiperImageService: SwiperImageService) {}

    @ApiOperation({summary:'保存轮播图'})
    @Post('saveSwiperImage')
    async saveSwiperImage(@Body() body: any){
        const Image:SwiperImage=body.swiperImage
        return await this.swiperImageService.saveSwiperImage(Image);
    }
    @ApiOperation({summary:'删除指定id的轮播图 '})
    @Post('removeSwiperImage')
    async removeSwiperImage(@Body() body: any){
        const {id}=body
        return await this.swiperImageService.removeSwiperImage(id);
    }
    
    @ApiOperation({summary:'搜索相关名字的轮播图'})
    @Post('searchSwiperImage')
    async searchSwiperImage(@Body() body:any){
        const {page,pageSize,name}=body
        return await this.swiperImageService.searchSwiperImage(page,pageSize,name);
    }

    @ApiOperation({summary:'修改选中的轮播图信息'})
    @Post('changeSwiperImage')
    async changeSwiperImage(@Body() body: any){
        const swiperImage:SwiperImage = body.swiperImage;     
        return await this.swiperImageService.changeSwiperImage(swiperImage);
    }

    @ApiOperation({summary:'修改选中的轮播图状态'})
    @Post('changeSwiperImageStatus')
    async changeSwiperImageStatus(@Body() body: any){
        const { id,status } = body;
        return await this.swiperImageService.changeSwiperImageStatus(id,status);
    }

    //微信端
    @ApiOperation({summary:'获取所有发布的轮播图'})
    @Get('getReleaseSwiperImage')
    async getReleaseSwiperImage(){
        return await this.swiperImageService.getReleaseSwiperImage();
    }
   
}
