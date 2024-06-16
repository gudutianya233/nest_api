import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { MedicineKnowledge } from './entities/medicine_knowledge.entity';
import { Doctor } from './entities/doctor.entity';
import { DoctorHonor } from './entities/doctor_honor.entity';


@ApiTags('医生的相关操作')
@Controller('doctor')
export class DoctorController {
    constructor(private readonly doctorService: DoctorService) { }


    //运维系统
    @ApiOperation({ summary: '首页获取pageSize条医生信息和医生的数量' })
    @Post('getDoctorInformationList')
    async getDoctorInformationList(@Body() body: any) {
        const { page, pageSize } = body
        return await this.doctorService.getDoctorInformationList(page, pageSize);
    }
    @ApiOperation({ summary: '修改选中医生的状态' })
    @Post('changeDoctorStatus')
    async changeDoctorStatus(@Body() body: any) {
        const { id, status } = body
        return await this.doctorService.changeDoctorStatus(id, status);
    }
    @ApiOperation({ summary: '选中的医生行上移' })
    @Post('doctorMoveUp')
    async doctorMoveUp(@Body() body: any) {
        const { index, indexUp } = body
        return await this.doctorService.doctorMoveUp(index, indexUp);
    }
    @ApiOperation({ summary: '选中的医生行下移' })
    @Post('doctorMoveDown')
    async doctorMoveDown(@Body() body: any) {
        const { index, indexDown } = body
        return await this.doctorService.doctorMoveDown(index, indexDown);
    }
    @ApiOperation({ summary: '删除选中医生' })
    @Post('removeDoctor')
    async removeDoctor(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctor(id);
    }
    @ApiOperation({ summary: '搜索医生' })
    @Post('searchDoctor')
    async searchDoctor(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctor(name, page, pageSize);
    }
    @ApiOperation({ summary: '保存医生' })
    @Post('saveDoctor')
    async saveDoctor(@Body() body: any) {
        const doctor: Doctor = body.doctor
        return await this.doctorService.saveDoctor(doctor);
    }
    @ApiOperation({ summary: '修改医生信息' })
    @Post('changeDoctor')
    async changeDoctor(@Body() body: any) {
        const doctor: Doctor = body.doctor
        return await this.doctorService.changeDoctor(doctor);
    }

    @ApiOperation({ summary: '保存一条中医小知识' })
    @Post('saveMedicineKnowledge')
    async saveMedicineKnowledge(@Body('content') content: MedicineKnowledge) {
        return await this.doctorService.saveMedicineKnowledge(content);
    }

    @ApiOperation({ summary: '修改选中的荣誉图片的状态' })
    @Post('changeDoctorHonorStatus')
    async changeDoctorHonorStatus(@Body() body: any) {
        const { id, status } = body
        return await this.doctorService.changeDoctorHonorStatus(id, status);
    }
    @ApiOperation({ summary: '搜索匹配医生名字的荣誉图片' })
    @Post('searchDoctorHonor')
    async searchDoctorHonor(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctorHonor(name, page, pageSize);
    }
    @ApiOperation({ summary: '删除选中的医生荣誉图片' })
    @Post('removeDoctorHonor')
    async removeDoctorHonor(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctorHonor(id);
    }
    @ApiOperation({ summary: '保存医生荣誉图片' })
    @Post('saveDoctorHonor')
    async saveDoctorHonor(@Body() body: any) {
        const doctorHonor: DoctorHonor = body.doctorHonor
        const doctorId = body.doctorHonor.doctorId
        return await this.doctorService.saveDoctorHonor(doctorHonor, doctorId);
    }
    @ApiOperation({ summary: '修改医生的荣誉图片信息' })
    @Post('changeDoctorHonor')
    async changeDoctorHonor(@Body() body: any) {
        const doctorHonor: DoctorHonor = body.doctorHonor
        return await this.doctorService.changeDoctorHonor(doctorHonor);
    }
    @ApiOperation({ summary: '选中的医生的成就上移' })
    @Post('doctorAchievementMoveUp')
    async doctorAchievementMoveUp(@Body() body: any) {
        const { index, indexUp } = body
        return await this.doctorService.doctorAchievementMoveUp(index, indexUp);
    }
    @ApiOperation({ summary: '选中的医生的成就下移' })
    @Post('doctorAchievementMoveDown')
    async doctorAchievementMoveDown(@Body() body: any) {
        const { index, indexDown } = body
        return await this.doctorService.doctorAchievementMoveDown(index, indexDown);
    }
    @ApiOperation({ summary: '保存医生的成就' })
    @Post('saveDoctorAchievement')
    async saveDoctorAchievement(@Body() body: any) {
        const  doctorAchievement= body.doctorAchievement
        const doctorId = body.doctorAchievement.doctorId
        return await this.doctorService.saveDoctorAchievement(doctorAchievement,doctorId);
    }
    @ApiOperation({ summary: '修改选中的医生成就的状态' })
    @Post('changeDoctorAchievementStatus')
    async changeDoctorAchievementStatus(@Body() body: any) {
        const { id, status } = body
        return await this.doctorService.changeDoctorAchievementStatus(id, status);
    }
    @ApiOperation({ summary: '删除选中的医生成就' })
    @Post('removeDoctorAchievement')
    async removeDoctorAchievement(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctorAchievement(id);
    }
    @ApiOperation({ summary: '搜索匹配医生名字的成就' })
    @Post('searchDoctorAchievement')
    async searchDoctorAchievement(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctorAchievement(name, page, pageSize);
    }
    @ApiOperation({ summary: '修改医生的成就信息' })
    @Post('changeDoctorAchievement')
    async changeDoctorAchievement(@Body() body: any) {
        const  doctorAchievement= body.doctorAchievement
        return await this.doctorService.changeDoctorAchievement(doctorAchievement);
    }
    @ApiOperation({ summary: '搜索匹配名字的助手信息' })
    @Post('searchDoctorAssistant')
    async searchDoctorAssistant(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctorAssistant(name, page, pageSize);
    }
    @ApiOperation({ summary: '修改选中的助手的状态' })
    @Post('changeDoctorAssistantStatus')
    async changeDoctorAssistantStatus(@Body() body: any) {
        const { id, status } = body
        return await this.doctorService.changeDoctorAssistantStatus(id, status);
    }
    @ApiOperation({ summary: '保存医生的助手' })
    @Post('saveDoctorAssistant')
    async saveDoctorAssistant(@Body() body: any) {
        const  doctorAssistant= body.doctorAssistant
        const doctorId = body.doctorAssistant.doctor.id
        return await this.doctorService.saveDoctorAssistant(doctorAssistant,doctorId);
    }
    
    @ApiOperation({ summary: '修改医生的助手' })
    @Post('changeDoctorAssistant')
    async changeDoctorAssistant(@Body() body: any) {
        const  doctorAssistant= body.doctorAssistant
        return await this.doctorService.changeDoctorAssistant(doctorAssistant);
    }

    @ApiOperation({ summary: '助手信息页面，编辑弹出框获得指定医生的名字' })
    @Post('getDoctor_name')
    async getDoctor_name(@Body() body: any) {
        const {id} = body;
        return await this.doctorService.getDoctor_name(id);
    }
    
    @ApiOperation({ summary: '删除选中的医生助理' })
    @Post('removeDoctorAssistant')
    async removeDoctorAssistant(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctorAssistant(id);
    }
    @ApiOperation({ summary: '搜索匹配医生名字的擅长治疗' })
    @Post('searchDoctorProficientTreatment')
    async searchDoctorProficientTreatment(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctorProficientTreatment(name, page, pageSize);
    }
    @ApiOperation({ summary: '删除选中的医生擅长治疗' })
    @Post('removeDoctorProficientTreatment')
    async removeDoctorProficientTreatment(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctorProficientTreatment(id);
    }
    @ApiOperation({ summary: '保存医生的擅长治疗' })
    @Post('saveDoctorProficientTreatment')
    async saveDoctorProficientTreatment(@Body() body: any) {
        const  doctorProficientTreatment= body.doctorProficientTreatment
        const doctorId = body.doctorProficientTreatment.doctorId
        return await this.doctorService.saveDoctorProficientTreatment(doctorProficientTreatment,doctorId);
    }
    @ApiOperation({ summary: '修改选中的医生擅长治疗的状态' })
    @Post('changeDoctorProficientTreatmentStatus')
    async changeDoctorProficientTreatmentStatus(@Body() body: any) {
        const { id, status } = body
        return await this.doctorService.changeDoctorProficientTreatmentStatus(id, status);
    }
    @ApiOperation({ summary: '修改医生擅长治疗信息' })
    @Post('changeDoctorProficientTreatment')
    async changeDoctorProficientTreatment(@Body() body: any) {
        const  doctorProficientTreatment= body.doctorProficientTreatment
        return await this.doctorService.changeDoctorProficientTreatment(doctorProficientTreatment);
    }
    @ApiOperation({ summary: '获取医生的排班情况' })
    @Post('searchDoctorWork')
    async searchDoctorWork(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchDoctorWork(name, page, pageSize);
    }
    @ApiOperation({ summary: '保存医生的排班情况' })
    @Post('saveDoctorWork')
    async saveDoctorWork(@Body() body: any) {
        const  doctorWork= body.doctorWork
        const doctorId = body.doctorWork.doctorId
        return await this.doctorService.saveDoctorWork(doctorWork,doctorId);
    }
    @ApiOperation({ summary: '删除选中的医生的排班' })
    @Post('removeDoctorWork')
    async removeDoctorWork(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeDoctorWork(id);
    }
    @ApiOperation({ summary: '修改选中的医生的排班信息' })
    @Post('changeDoctorWork')
    async changeDoctorWork(@Body() body: any) {
        const  doctorWork= body.doctorWork
        return await this.doctorService.changeDoctorWork(doctorWork);
    }
    @ApiOperation({ summary: '给选中的医生未来29天进行排班' })
    @Post('doctorWorkScheduling')
    async doctorWorkScheduling(@Body() body: any) {
        const work= body.work
        const doctorId= body.doctorId
        const doctorWorkId= body.doctorWorkId
        return await this.doctorService.doctorWorkScheduling(work,doctorId,doctorWorkId);
    }
    @ApiOperation({ summary: '获取医生的出诊时间' })
    @Post('searchWorkTime')
    async searchWorkTime(@Body() body: any) {
        const { name, page, pageSize } = body;
        return await this.doctorService.searchWorkTime(name, page, pageSize);
    }
    @ApiOperation({ summary: '修改选中的医生的出诊时间' })
    @Post('changeWorkTime')
    async changeWorkTime(@Body() body: any) {
        const  workTime= body.workTime
        return await this.doctorService.changeWorkTime(workTime);
    }
    @ApiOperation({ summary: '删除选中的医生的排班' })
    @Post('removeWorkTime')
    async removeWorkTime(@Body() body: any) {
        const { id } = body
        return await this.doctorService.removeWorkTime(id);
    }

    @ApiOperation({ summary: '获取医生的预约数据,匹配就诊人名字/电话' })
    @Post('searchDoctorAppointment')
    async searchDoctorAppointment(@Body() body: any) {
        const { search, page, pageSize } = body;
        return await this.doctorService.searchDoctorAppointment(search, page, pageSize);
    }
    @ApiOperation({ summary: '患者进行签到' })
    @Post('patientSign')
    async patientSign(@Body() body: any) {
        const doctorAppointment = body.doctorAppointment;
        return await this.doctorService.patientSign(doctorAppointment);
    }
    @ApiOperation({ summary: '修改患者的预约信息' })
    @Post('changeDoctorAppointment')
    async changeDoctorAppointment(@Body() body: any) {
        const doctorAppointment = body.doctorAppointment;
        return await this.doctorService.changeDoctorAppointment(doctorAppointment);
    }
    


    //微信端 
    @ApiOperation({ summary: '首页获取医生的简单信息列表' })
    @Get('getDoctorSimpleInformation')
    async getDoctorSimpleInformation() {
        return await this.doctorService.getDoctorSimpleInformation();
    }

    @ApiOperation({ summary: '名医堂获取医生的详细信息列表' })
    @Post('getDoctorInformation')
    async getDoctorInformation(@Body() body: any) {
        const {name}=body
        return await this.doctorService.getDoctorInformation(name);
    }

    @ApiOperation({ summary: '挂号页面获取医生的详细信息' })
    @Post('getDoctorAllInformation')
    async getDoctorAllInformation(@Body() body: any) {
        //医生id
        const { id } = body;
        return await this.doctorService.getDoctorAllInformation(id);
    }

    @ApiOperation({ summary: '医生详情页面获取医生的出诊安排表id' })
    @Post('getDoctorWorkId')
    async getDoctorWorkId(@Body() body: any) {
        const{doctorId}  = body;
        return await this.doctorService.getDoctorWorkId(doctorId);
    }
    
    @ApiOperation({ summary: '医生详情页面获取医生的出诊时间' })
    @Post('getDoctorWorkTime')
    async getDoctorWorkTime(@Body() body: any) {
        const {doctorId,doctorWorkId} = body;
        return await this.doctorService.getDoctorWorkTime(doctorId,doctorWorkId);
    }

    @ApiOperation({ summary: '挂号页面获取指定id医生的信息' })
    @Post('getRegisterDoctor')
    async getRegisterDoctor(@Body() body: any) {
        const {doctorId} = body;
        return await this.doctorService.getRegisterDoctor(doctorId);
    }

}
