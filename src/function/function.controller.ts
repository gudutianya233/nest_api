import { Body, Controller, Get, Post } from '@nestjs/common';
import { FunctionService } from './function.service';
import { ApiOperation } from '@nestjs/swagger';
import { CommondAbility } from './entities/commondAbility.entity';

@Controller('function')
export class FunctionController {
    constructor(private readonly functionService: FunctionService) {}

    @ApiOperation({summary:'保存添加的常用功能'})
    @Post('saveCommondAbility')
    async saveCommondAbility(@Body() body: any){
        const Image:CommondAbility=body.commondAbility
        return await this.functionService.saveCommondAbility(Image);
    }
    @ApiOperation({summary:'获取10条常用功能'})
    @Post('getAllCommondAbility')
    async getAllCommondAbility(@Body() body:any){
        const {page,pageSize}=body
        return await this.functionService.getAllCommondAbility(page,pageSize);
    }
    @ApiOperation({summary:'修改选中功能的状态'})
    @Post('changeCommondAbilityStatus')
    async changeCommondAbilityStatus(@Body() body:any){
        const {id,status}=body
        return await this.functionService.changeCommondAbilityStatus(id,status);
    }
    @ApiOperation({summary:'修改选中功能的信息'})
    @Post('changeCommondAbility')
    async changeCommondAbility(@Body() body: any){
        const commondAbility:CommondAbility = body.commondAbility;     
        return await this.functionService.changeCommondAbility(commondAbility);
    }
    @ApiOperation({summary:'删除选中功能'})
    @Post('removeCommondAbility')
    async removeCommondAbility(@Body() body:any){
        const {id}=body
        return await this.functionService.removeCommondAbility(id);
    }
    @ApiOperation({summary:'搜索相关名字的功能'})
    @Post('searchCommondAbility')
    async searchCommondAbility(@Body() body:any){
        const {name}=body
        return await this.functionService.searchCommondAbility(name);
    }

    //微信端
    @ApiOperation({summary:'获取状态为true的常用功能'})
    @Get('getCommondAbility')
    async getCommondAbility(){
        return await this.functionService.getCommondAbility();
    }
}
