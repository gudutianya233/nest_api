import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HospitalService } from './hospital.service';
import { HospitalHonor } from './entities/hospital_honor.entity';

@ApiTags('医馆的相关操作')

@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) {}

    @ApiOperation({summary:'保存医馆的荣誉图片'})
    @Post('saveHospitalHonorImage')
    async saveHospitalHonorImage(@Body() body: any) {
        const hospitalHonor:HospitalHonor =body.hospitalHonor
        return await this.hospitalService.saveHospitalHonorImage(hospitalHonor);
    }
    @ApiOperation({summary:'删除选中的的荣誉图片'})
    @Post('removeHospitalHonor')
    async removeHospitalHonor(@Body() body: any) {
        const id =body
        return await this.hospitalService.removeHospitalHonor(id);
    }
    @ApiOperation({summary:'修改选中的的荣誉图片状态'})
    @Post('changeHospitalHonorStatus')
    async changeHospitalHonorStatus(@Body() body: any) {
        const {id,status} =body
        return await this.hospitalService.changeHospitalHonorStatus(id,status);
    }
    @ApiOperation({summary:'修改选中的的荣誉图片信息'})
    @Post('changeeditHospitalHonor')
    async changeeditHospitalHonor(@Body() body: any) {
        const hospitalHonor:HospitalHonor =body.hospitalHonor
        return await this.hospitalService.changeeditHospitalHonor(hospitalHonor);
    }

    @ApiOperation({summary:'搜索匹配名字的数据'})
    @Post('searchHospitalHonor')
    async searchHospitalHonor(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.hospitalService.searchHospitalHonor(name, page, pageSize);
    }
    

    //微信端
    @ApiOperation({summary:'首页获取医馆的状态为true的荣誉图片'})
    @Get('getHospitalHonorImage')
    async getDoctorSimpleInformation() {
        return await this.hospitalService.getHospitalHonorImage();
    }
}
