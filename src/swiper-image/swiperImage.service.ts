import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Like, Repository } from 'typeorm';
import { SwiperImage } from './entities/swiperImage.entity';

@Injectable()
export class SwiperImageService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(SwiperImage)
        private readonly swiperImageRepository: Repository<SwiperImage>,
        //nest事务
        private connection: Connection,
    ) { }

    //保存轮播图
    async saveSwiperImage(swiperImage: SwiperImage) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const Image = new SwiperImage()
            Image.url = swiperImage.url
            Image.name = swiperImage.name
            Image.status = swiperImage.status
            Image.create_time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
            const res = await this.swiperImageRepository.save(Image);
            if (res) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            // 如果发生错误，则回滚事务
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }

    }
    //删除指定id的轮播图
    async removeSwiperImage(id: number) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await this.swiperImageRepository.delete(id);
            if (result.affected > 0) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            // 如果发生错误，则回滚事务
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }

    }

    //获取10条轮播图片
    async getAllSwiperImage(page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip: number = (page - 1) * pageSize;
        const data = await this.swiperImageRepository.find({
            skip,
            take: pageSize,
        });
        // 查询数据库，获取数据总条目数
        const total = await this.swiperImageRepository.count();
        return { data, total };
    }
    //获取所有发布的轮播图片
    async getReleaseSwiperImage() {
        const AllSwiperImage = await this.swiperImageRepository.find({
            where: {
                status: true
            }
        })
        return AllSwiperImage;
    }

    //修改选中的轮播图信息
    async changeSwiperImage(swiperImage: SwiperImage) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const res = await this.swiperImageRepository.update(
                swiperImage.id,
                { name: swiperImage.name, url: swiperImage.url, status: swiperImage.status }
            );
            const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
            return success;
        } catch (err) {
            // 如果发生错误，则回滚事务
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }

    }

    //修改选中的轮播图状态
    async changeSwiperImageStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const res = await this.swiperImageRepository.update(id, { status: status });
            const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
            return success;
        } catch (err) {
            // 如果发生错误，则回滚事务
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }

    }

    //搜索相关名字的轮播同
    async searchSwiperImage(page: number, pageSize: number, name: string) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.swiperImageRepository
            .createQueryBuilder('swiper_image')
            .where('swiper_image.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.swiperImageRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }

}
