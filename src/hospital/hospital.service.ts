import { Injectable } from '@nestjs/common';
import { HospitalHonor } from './entities/hospital_honor.entity';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Like, Repository } from 'typeorm';

@Injectable()
export class HospitalService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(HospitalHonor)
        private readonly hospitalHonorRepository: Repository<HospitalHonor>,
        //nest事务
        private connection: Connection,
      ) {}


//删除指定id的荣誉图片
async removeHospitalHonor(id:number){
    const result = await this.hospitalHonorRepository.delete(id);
    if (result.affected > 0) {
        return true;
    } else {
        return false;
    }


}
//修改选中的的荣誉图片状态
async changeHospitalHonorStatus(id:number,status:boolean){
    const res = await this.hospitalHonorRepository.update(id, { status: status });
    const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
    return success;

}
//修改选中的的荣誉图片信息
async changeeditHospitalHonor(hospitalHonor:HospitalHonor){
    const res = await this.hospitalHonorRepository.update(
        hospitalHonor.id, 
        { name:hospitalHonor.name,url:hospitalHonor.url,status:hospitalHonor.status,type:hospitalHonor.type}
        );
    const success = res && (res.affected > 0 || res.raw.affectedRows > 0);
    return success;


}
//搜索匹配名字的数据
async searchHospitalHonor(name: string, page: number, pageSize: number){
      // 计算要跳过的条目数
  const skip = (page - 1) * pageSize;
  const data = await this.hospitalHonorRepository
    .createQueryBuilder('hospital_honor')
    .where('hospital_honor.name LIKE :name', { name: `%${name}%` })
    .orderBy('hospital_honor.create_time', 'DESC')
    .skip(skip)
    .take(pageSize)
    .getMany();
  // 查询数据库，获取数据总条目数
  const total = await this.hospitalHonorRepository.count({
    where: { name: Like(`%${name}%`) },
  });
  return { data, total }; 
}
//保存医馆的荣誉图片
async saveHospitalHonorImage(hospitalHonor:HospitalHonor){
    const hospital = new HospitalHonor()
    hospital.name=hospitalHonor.name
    hospital.status=hospitalHonor.status
    hospital.type=hospitalHonor.type
    hospital.url=hospitalHonor.url
    hospital.create_time= new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const res = await this.hospitalHonorRepository.save(hospital);
    if (res) {
        return true;
    } else {
        return false;
    }

}

//微信首页获取医馆的状态为true的荣誉图片
    async getHospitalHonorImage(){
        const hospitalHonorImage=await this.hospitalHonorRepository.find({
    where: {
        status: true
    }
 });
        return hospitalHonorImage;
    }
}
