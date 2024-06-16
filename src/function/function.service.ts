import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CommondAbility } from './entities/commondAbility.entity';

@Injectable()
export class FunctionService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(CommondAbility)
        private readonly commondAbilityRepository: Repository<CommondAbility>,
        //nest事务
        private connection: Connection,
    ) { }

    //保存添加的常用功能
    async saveCommondAbility(commondAbility: CommondAbility) {

        const ability = new CommondAbility()
        ability.name = commondAbility.name
        ability.status = commondAbility.status
        ability.type = commondAbility.type
        ability.url = commondAbility.url
        ability.create_time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        const res = await this.commondAbilityRepository.save(ability);
        if (res) {
            return true;
        } else {
            return false;
        }


    }


    //查询10条常用功能
    async getAllCommondAbility(page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip: number = (page - 1) * pageSize;
        const data = await this.commondAbilityRepository.find({
            skip,
            take: pageSize,
        });
        // 查询数据库，获取数据总条目数
        const total = await this.commondAbilityRepository.count();
        return { data, total };
    }

    //修改选中功能的信息
    async changeCommondAbility(commondAbility: CommondAbility) {
        const res = await this.commondAbilityRepository.update(
            commondAbility.id,
            { name: commondAbility.name, url: commondAbility.url, status: commondAbility.status, type: commondAbility.type }
        );
        const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
        return success;

    }

    //修改选中功能的状态
    async changeCommondAbilityStatus(id: number, status: boolean) {
        const res = await this.commondAbilityRepository.update(id, { status: status });
        const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
        return success;

    }
    //删除选中功能
    async removeCommondAbility(id: number) {
        const result = await this.commondAbilityRepository.delete(id);
        if (result.affected > 0) {
            return true;
        } else {
            return false;
        }

    }
    //搜索相关名字的功能
    async searchCommondAbility(name: string) {
        {
            const data = this.commondAbilityRepository
                .createQueryBuilder('commond_ability')
                .where('commond_ability.name LIKE :name', { name: `%${name}%` })
                .getMany();
            return data
        }
    }


    //微信端
    //获得状态为true的常用功能
    async getCommondAbility() {
        const data = await this.commondAbilityRepository.find({
            where: {
                status: true
            },

        });
        return data;
    }

}

