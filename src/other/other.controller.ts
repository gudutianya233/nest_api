import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OtherService } from './other.service';

@ApiTags('公告相关操作')
@Controller('other')
export class OtherController {
    constructor(private readonly otherService: OtherService) {}

//运维端
@ApiOperation({ summary: '获取pageSize条公告' })
@Post('searchAnnouncemeList')
async searchAnnouncemeList(@Body() body: any) {
    const { page, pageSize,name } = body
    return await this.otherService.searchAnnouncemeList(page, pageSize,name);
}
@ApiOperation({ summary: '保存公告' })
@Post('saveAnnouncement')
async saveAnnouncement(@Body() body: any) {
    const announcement = body.announcement
    return await this.otherService.saveAnnouncement(announcement);
}
@ApiOperation({ summary: '删除选中公告' })
@Post('removeAnnouncement')
async removeAnnouncement(@Body() body: any) {
    const { id } = body
    return await this.otherService.removeAnnouncement(id);
}
@ApiOperation({ summary: '修改选中公告状态' })
@Post('changeAnnouncementStatus')
async changeAnnouncementStatus(@Body() body: any) {
    const {id,status} = body
    return await this.otherService.changeAnnouncementStatus(id,status);
}
@ApiOperation({ summary: '修改的公告信息' })
@Post('changeAnnouncement')
async changeAnnouncement(@Body() body: any) {
    const announcement = body.announcement
    return await this.otherService.changeAnnouncement(announcement);
}
@ApiOperation({ summary: '搜索匹配标题的投诉' })
@Post('searchComplaintMail')
async searchComplaintMail(@Body() body: any) {
  const { name, page, pageSize } = body;
  return await this.otherService.searchComplaintMail(name, page, pageSize);
}

    //微信端
    @ApiOperation({summary:'获取最新的一条公告'})
    @Get('getLatestAnnouncement')
    async getLatestAnnouncement() {
        return await this.otherService.getLatestAnnouncement();
    }

    @ApiOperation({summary:'获取通过的公告条数'})
    @Get('getAnnouncementCount')
    async getAnnouncementCount() {
        return await this.otherService.getAnnouncementCount();
      }

    @ApiOperation({summary:'获取5条通过的公告'})
    @Post('getAnnouncement')
    async getAnnouncement(@Body() body: any) {
        //跳过的记录数
        const { skip } = body;
        //每次获取5条数据
        const { take } = body;
        return await this.otherService.getAnnouncement(skip, take);
      }
}
