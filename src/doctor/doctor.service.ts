import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, LessThan, Like, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorHonor } from './entities/doctor_honor.entity';
import { DoctorAchievement } from './entities/doctor_achievement.entity';
import { DoctorProficientTreatment } from './entities/doctor.proficient_treatment.entity';
import { DoctorInfo } from './entities/doctor_Info';
import { MedicineKnowledge } from './entities/medicine_knowledge.entity';
import { DoctorWork } from './entities/doctor_work.entity';
import { WorkTime } from './entities/work_time.entity';
import { DoctorAssistant } from './entities/doctor_assistant.entity';
import { DoctorAppointment } from './entities/doctor_appointment.entity';
import { UserRegister } from 'src/users/entities/user_register.entity';

@Injectable()
export class DoctorService {
    constructor(
        //医生信息
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        //医生荣誉
        @InjectRepository(DoctorHonor)
        private readonly doctorHonorRepository: Repository<DoctorHonor>,
        //医生成就
        @InjectRepository(DoctorAchievement)
        private readonly doctorAchievementRepository: Repository<DoctorAchievement>,
        //医生擅长治疗
        @InjectRepository(DoctorProficientTreatment)
        private readonly doctorProficientTreatmentRepository: Repository<DoctorProficientTreatment>,
        //中医小知识
        @InjectRepository(MedicineKnowledge)
        private readonly medicineKnowledgeRepository: Repository<MedicineKnowledge>,
        //医生出诊安排
        @InjectRepository(DoctorWork)
        private readonly doctorWorkRepository: Repository<DoctorWork>,
        //医生出诊的具体日期
        @InjectRepository(WorkTime)
        private readonly workTimeRepository: Repository<WorkTime>,
        //医生绑定的助手
        @InjectRepository(DoctorAssistant)
        private readonly doctorAssistantRepository: Repository<DoctorAssistant>,
        //医生绑定的助手
        @InjectRepository(DoctorAppointment)
        private readonly doctorAppointmentRepository: Repository<DoctorAppointment>,

        //nest事务
        private connection: Connection,
    ) { }

    ///运维端
    //首页获取pageSize条医生信息和医生的数量
    async getDoctorInformationList(page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip: number = (page - 1) * pageSize;
        const data = await this.doctorRepository.find({
            skip,
            take: pageSize,
            order: {
                doctor_sort: 'ASC'
            }
        });
        // 查询数据库，获取数据总条目数
        const total = await this.doctorRepository.count();
        return { data, total };
    }
    //修改选中医生的状态
    async changeDoctorStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const res = await queryRunner.manager.update(
                Doctor,
                id,
                { switch: status },
            );

            await queryRunner.commitTransaction();

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
    //选中的医生行上移
    async doctorMoveUp(index: number, indexUp: number) {
        // 获取要交换的两个医生的实体 
        const doctor1 = await this.doctorRepository.findOne({ where: { doctor_sort: index } });
        const doctor2 = await this.doctorRepository.findOne({ where: { doctor_sort: indexUp } });
        // 判断是否存在 
        if (doctor1 && doctor2) {
            // 交换两个医生的排序
            [doctor1.doctor_sort, doctor2.doctor_sort] = [doctor2.doctor_sort, doctor1.doctor_sort];
            // 保存到数据库
            await this.doctorRepository.save([doctor1, doctor2]);
            // 返回成功的信息 
            return true
        }
        else {
            return false
        }
    }
    //选中的医生行下移
    async doctorMoveDown(index: number, indexDown: number) {
        // 获取要交换的两个医生的实体 
        const doctor1 = await this.doctorRepository.findOne({ where: { doctor_sort: index } });
        const doctor2 = await this.doctorRepository.findOne({ where: { doctor_sort: indexDown } });
        // 判断是否存在 
        if (doctor1 && doctor2) {
            // 交换两个医生的排序
            [doctor1.doctor_sort, doctor2.doctor_sort] = [doctor2.doctor_sort, doctor1.doctor_sort];
            // 保存到数据库
            await this.doctorRepository.save([doctor1, doctor2]);
            // 返回成功的信息 
            return true
        }
        else {
            return false
        }
    }
    //删除选中医生
    async removeDoctor(id: number) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await this.doctorRepository.delete(id);
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

    //搜索医生
    async searchDoctor(name: string, page: number, pageSize: number) {

        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorRepository
            .createQueryBuilder('doctor')
            .where('doctor.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };

    }

    //保存医生
    async saveDoctor(doctor: Doctor) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const doctros = new Doctor();
            doctros.name = doctor.name;
            doctros.title = doctor.title;
            doctros.head__picture = doctor.head__picture;
            doctros.original_registration_cost = doctor.original_registration_cost;
            doctros.registration_cost = doctor.registration_cost;
            doctros.attention = doctor.attention;
            doctros.receive_number = doctor.receive_number;
            doctros.favorable_rate = doctor.favorable_rate;
            doctros.switch = doctor.switch;
            doctros.overview_content = doctor.overview_content;
            doctros.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            // 获取doctor表中最大的doctor_sort值
            const maxSort = await queryRunner.manager.query(
                'SELECT MAX(doctor_sort) FROM doctor'
            );
            // 将其加一作为新插入数据的doctor_sort值
            doctros.doctor_sort = maxSort[0]['MAX(doctor_sort)'] + 1;
            const res = await queryRunner.manager.save(doctros);


            await queryRunner.commitTransaction();

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
    //修改医生信息
    async changeDoctor(doctor: Doctor) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const res = await queryRunner.manager.update(
                Doctor,
                doctor.id,
                {
                    name: doctor.name,
                    switch: doctor.switch,
                    title: doctor.title,
                    original_registration_cost: doctor.original_registration_cost,
                    registration_cost: doctor.registration_cost,
                    attention: doctor.attention,
                    receive_number: doctor.receive_number,
                    favorable_rate: doctor.favorable_rate,
                    overview_content: doctor.overview_content,
                },
            );

            await queryRunner.commitTransaction();

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

    //保存中医小知识
    async saveMedicineKnowledge(content: MedicineKnowledge) {
        const medicineKnowledge = new MedicineKnowledge()
        medicineKnowledge.content = content.content;
        medicineKnowledge.cover_image = content.cover_image
        medicineKnowledge.create_time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        medicineKnowledge.doctor = content.doctor
        medicineKnowledge.isSwitch = true
        medicineKnowledge.like_number = 0
        medicineKnowledge.read_number = 0
        medicineKnowledge.title = content.title
        // 将记录保存到数据库中
        await this.medicineKnowledgeRepository.save(medicineKnowledge);
    }

    //修改选中的荣誉图片的状态
    async changeDoctorHonorStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorHonor,
                id,
                {
                    status: status,
                    update_time: updateDate
                },
            );

            await queryRunner.commitTransaction();

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
    //搜索匹配医生名字的荣誉图片
    async searchDoctorHonor(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorHonorRepository
            .createQueryBuilder('doctor_honor')
            .where('doctor_honor.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorHonorRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }
    //删除选中医生的荣誉图片
    async removeDoctorHonor(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(DoctorHonor, id);

            await queryRunner.commitTransaction();

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
    //保存医生的荣誉图片
    async saveDoctorHonor(doctorHonor: DoctorHonor, doctorId: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const doctorHonors = new DoctorHonor();
            doctorHonors.name = doctorHonor.name;
            doctorHonors.url = doctorHonor.url;
            doctorHonors.status = doctorHonor.status;
            doctorHonors.honor_type = doctorHonor.honor_type;
            doctorHonors.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });

            // 获取一个 Doctor 实体
            const doctor = await queryRunner.manager.findOne(Doctor, {
                where: { id: doctorId },
            });
            // 设置 doctorHonors.doctor 属性
            doctorHonors.doctor = doctor;

            const res = await queryRunner.manager.save(doctorHonors);

            await queryRunner.commitTransaction();

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

    //修改医生的荣誉图片信息
    async changeDoctorHonor(doctorHonor: DoctorHonor) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });

            const res = await queryRunner.manager.update(
                DoctorHonor,
                doctorHonor.id,
                {
                    status: doctorHonor.status,
                    honor_type: doctorHonor.honor_type,
                    update_time: updateDate,
                },
            );

            await queryRunner.commitTransaction();

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


    //保存医生的成就
    async saveDoctorAchievement(doctorAchievement: DoctorAchievement, doctorId: number,) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const doctorAchievements = new DoctorAchievement();
            doctorAchievements.name = doctorAchievement.name;
            doctorAchievements.status = doctorAchievement.status;
            doctorAchievements.title = doctorAchievement.title;
            doctorAchievements.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });

            // 获取一个 Doctor 实体
            const doctor = await queryRunner.manager.findOne(Doctor, {
                where: { id: doctorId },
            });
            // 设置 DoctorAchievement.doctor 属性
            doctorAchievements.doctor = doctor;
            // 获取成就表中最大的sort值
            const maxSort = await queryRunner.manager.query(
                'SELECT MAX(sort) FROM doctor_achievement WHERE doctorId = ?', [doctorId]
            );
            // 将其加一作为新插入数据的sort值
            doctorAchievements.sort = maxSort[0]['MAX(sort)'] + 1;
            const res = await queryRunner.manager.save(doctorAchievements);

            await queryRunner.commitTransaction();

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

    //修改医生的成就
    async changeDoctorAchievement(doctorAchievement: DoctorAchievement) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorAchievement,
                doctorAchievement.id,
                {
                    status: doctorAchievement.status,
                    title: doctorAchievement.title,
                    update_time: updateDate,
                },
            );

            await queryRunner.commitTransaction();

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

    //选中的医生的成就上移
    async doctorAchievementMoveUp(index: number, indexUp: number) {
        // 获取要交换的两个医生成就的实体 
        const doctorAchievement1 = await this.doctorAchievementRepository.findOne({ where: { sort: index } });
        const doctorAchievement2 = await this.doctorAchievementRepository.findOne({ where: { sort: indexUp } });
        // 判断是否存在 
        if (doctorAchievement1 && doctorAchievement2) {
            // 交换两个成就的排序
            [doctorAchievement1.sort, doctorAchievement2.sort] = [doctorAchievement2.sort, doctorAchievement1.sort];
            // 保存到数据库
            await this.doctorAchievementRepository.save([doctorAchievement1, doctorAchievement2]);
            // 返回成功的信息 
            return true
        }
        else {
            return false
        }
    }
    //选中的医生的成就下移
    async doctorAchievementMoveDown(index: number, indexDown: number) {
        // 获取要交换的两个医生成就的实体 
        const doctorAchievement1 = await this.doctorAchievementRepository.findOne({ where: { sort: index } });
        const doctorAchievement2 = await this.doctorAchievementRepository.findOne({ where: { sort: indexDown } });
        // 判断是否存在 
        if (doctorAchievement1 && doctorAchievement2) {
            // 交换两个成就的排序
            [doctorAchievement1.sort, doctorAchievement2.sort] = [doctorAchievement2.sort, doctorAchievement1.sort];
            // 保存到数据库
            await this.doctorAchievementRepository.save([doctorAchievement1, doctorAchievement2]);
            // 返回成功的信息 
            return true
        }
        else {
            return false
        }
    }


    //修改选中的医生成就的状态
    async changeDoctorAchievementStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorAchievement,
                id,
                {
                    status: status,
                    update_time: updateDate
                },
            );

            await queryRunner.commitTransaction();

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
    //删除选中医生成就
    async removeDoctorAchievement(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(DoctorAchievement, id);

            await queryRunner.commitTransaction();

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
    //搜索匹配医生名字的成就
    async searchDoctorAchievement(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorAchievementRepository
            .createQueryBuilder('doctor_honor')
            .where('doctor_honor.name LIKE :name', { name: `%${name}%` })
            .orderBy('doctor_honor.name', 'ASC') // 按照sort升序排序
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorAchievementRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }
    //搜索匹配名字的助手信息
    async searchDoctorAssistant(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorAssistantRepository
            .createQueryBuilder('doctor_assistant')
            .where('doctor_assistant.name LIKE :name', { name: `%${name}%` })
            .leftJoinAndSelect('doctor_assistant.doctor', 'doctor')
            .select(['doctor_assistant', 'doctor.name', 'doctor.id'])
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorAssistantRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }
    //保存医生的助手
    async saveDoctorAssistant(doctorAssistant: DoctorAssistant, doctorId: number,) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const doctorAssistants = new DoctorAssistant();
            doctorAssistants.openid = doctorAssistant.openid;
            doctorAssistants.unionid = doctorAssistant.unionid;
            doctorAssistants.name = doctorAssistant.name;
            doctorAssistants.nickname = doctorAssistant.nickname;
            doctorAssistants.name = doctorAssistant.name;
            doctorAssistants.number = doctorAssistant.number;
            doctorAssistants.role = doctorAssistant.role;
            doctorAssistants.status = doctorAssistant.status;
            doctorAssistants.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });

            // 获取一个 Doctor 实体
            const doctor = await queryRunner.manager.findOne(Doctor, {
                where: { id: doctorId },
            });
            // 设置 DoctorAchievement.doctor 属性
            doctorAssistants.doctor = doctor;

            const res = await queryRunner.manager.save(doctorAssistants);

            await queryRunner.commitTransaction();

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
    //助手信息页面，编辑弹出框获得指定医生的名字
    async getDoctor_name(id: number) {
        const doctorSimpleInformation = await this.doctorRepository.find({
            where: {
                id: id
            }
        });
        //遍历数据，只给前端返回名字
        const Doctor = doctorSimpleInformation.map(doctor => ({
            name: doctor.name,

        }));
        return Doctor;
    }

    //删除选中医生助手
    async removeDoctorAssistant(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(DoctorAssistant, id);

            await queryRunner.commitTransaction();

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
    //修改医生的助手
    async changeDoctorAssistant(doctorAssistant: DoctorAssistant) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorAssistant,
                doctorAssistant.id,
                {
                    openid: doctorAssistant.openid,
                    unionid: doctorAssistant.unionid,
                    name: doctorAssistant.name,
                    nickname: doctorAssistant.nickname,
                    number: doctorAssistant.number,
                    role: doctorAssistant.role,
                    status: doctorAssistant.status,
                    update_time: updateDate,
                },
            );

            await queryRunner.commitTransaction();

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

    //修改选中的医生成就的状态
    async changeDoctorAssistantStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorAssistant,
                id,
                {
                    status: status,
                    update_time: updateDate
                },
            );

            await queryRunner.commitTransaction();

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

    //搜索匹配医生名字的擅长治疗
    async searchDoctorProficientTreatment(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorProficientTreatmentRepository
            .createQueryBuilder('doctor_honor')
            .where('doctor_honor.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorProficientTreatmentRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }

    //删除选中医生擅长治疗
    async removeDoctorProficientTreatment(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(DoctorProficientTreatment, id);

            await queryRunner.commitTransaction();

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

    //保存医生的擅长治疗
    async saveDoctorProficientTreatment(doctorProficientTreatment: DoctorProficientTreatment, doctorId: number,) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const doctorProficientTreatmens = new DoctorProficientTreatment();
            doctorProficientTreatmens.name = doctorProficientTreatment.name;
            doctorProficientTreatmens.status = doctorProficientTreatment.status;
            doctorProficientTreatmens.subjects = doctorProficientTreatment.subjects;
            doctorProficientTreatmens.proficient_treatment = doctorProficientTreatment.proficient_treatment;
            doctorProficientTreatmens.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });

            // 获取一个 Doctor 实体
            const doctor = await queryRunner.manager.findOne(Doctor, {
                where: { id: doctorId },
            });
            // 设置 DoctorProficientTreatment.doctor 属性
            doctorProficientTreatmens.doctor = doctor;

            const res = await queryRunner.manager.save(doctorProficientTreatmens);

            await queryRunner.commitTransaction();

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
    //修改选中的医生擅长治疗的状态
    async changeDoctorProficientTreatmentStatus(id: number, status: boolean) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorProficientTreatment,
                id,
                {
                    status: status,
                    update_time: updateDate
                },
            );

            await queryRunner.commitTransaction();

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
    //修改医生的擅长治疗
    async changeDoctorProficientTreatment(doctorProficientTreatment: DoctorProficientTreatment) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorProficientTreatment,
                doctorProficientTreatment.id,
                {
                    status: doctorProficientTreatment.status,
                    subjects: doctorProficientTreatment.subjects,
                    proficient_treatment: doctorProficientTreatment.proficient_treatment,
                    update_time: updateDate,
                },
            );

            await queryRunner.commitTransaction();

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


    //首页获取医生的简单信息列表
    async getDoctorSimpleInformation() {
        const doctorSimpleInformation = await this.doctorRepository.find({
            where: {
                switch: true
            }
        });
        //遍历数据，只给前端返回头像，名字，头衔
        const DoctorList = doctorSimpleInformation.map(doctor => ({
            id: doctor.id,
            name: doctor.name,
            head__picture: doctor.head__picture,
            title: doctor.title,

        }));
        return DoctorList;
    }


    //微信端
    //名医堂页面获取医生表的所有信息
    async getDoctorInformation(name: string) {
        const whereClause = {
            switch: true
        };
        if (name) {
            whereClause['name'] = Like(`%${name}%`);
        }
        const doctorInformation = await this.doctorRepository.find({
            where: whereClause,
            order: {
                doctor_sort: 'ASC'
            }
        });
        //遍历数据，只给前端返回头像，名字，头衔,简介
        const DoctorList = doctorInformation.map(doctor => ({
            id: doctor.id,
            name: doctor.name,
            head__picture: doctor.head__picture,
            title: doctor.title,
            overview_content: doctor.overview_content,
        }));
        return DoctorList;
    }


    //挂号页面获取医生的详细信息(基本信息，荣誉，成就，擅长治疗)
    async getDoctorAllInformation(id: number) {
        //医生信息
        const doctor = await this.doctorRepository.findOne({
            where: {
                switch: true,
                id: id
            }
        });
        //医生荣誉
        const doctorHonor = await this.doctorHonorRepository.find({
            where: {
                doctor: { id: id },
                status: true
            }
        })
        //医生成就
        const doctorAchievement = await this.doctorAchievementRepository.find({
            where: {
                doctor: { id: id },
                status: true
            },
            order: {
                sort: 'ASC'
            }
        })
        //医生擅长治疗
        const doctorProficientTreatment = await this.doctorProficientTreatmentRepository.find({
            where: {
                doctor: { id: id },
                status: true
            }
        })
        const res = new DoctorInfo(
            doctorHonor,
            doctorAchievement,
            doctorProficientTreatment,
            doctor
        );
        return res;
    }

    //获取医生的出诊时间安排
    async searchDoctorWork(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.doctorWorkRepository
            .createQueryBuilder('doctor_work')
            .leftJoinAndSelect('doctor_work.doctor', 'doctor')
            .where('doctor_work.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.doctorWorkRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }
    //保存医生的出诊时间安排
    async saveDoctorWork(doctorWork: DoctorWork, doctorId: number) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 查询数据库中是否已经存在具有给定 doctorId 的 DoctorWork 实体
            const existingDoctorWork = await queryRunner.manager.findOne(DoctorWork, {
                where: { doctor: { id: doctorId } },
            });

            if (existingDoctorWork) {
                // 如果已经存在，则不允许添加新数据
                return false;
            } else {
                // 如果不存在，则创建新数据
                const doctorWorks = new DoctorWork();
                doctorWorks.name = doctorWork.name;
                doctorWorks.work = doctorWork.work;
                doctorWorks.create_time = new Date().toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                });
                // 获取一个 Doctor 实体
                const doctor = await queryRunner.manager.findOne(Doctor, {
                    where: { id: doctorId },
                });
                // 设置 DoctorProficientTreatment.doctor 属性
                doctorWorks.doctor = doctor;
                await queryRunner.manager.save(doctorWorks);
            }

            await queryRunner.commitTransaction();
            return true;
        } catch (err) {
            // 如果发生错误，则回滚事务
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }
    }


    //删除选中医生的排班
    async removeDoctorWork(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(DoctorWork, id);

            await queryRunner.commitTransaction();

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

    //修改选中的医生的排班信息
    async changeDoctorWork(doctorWork: DoctorWork) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                DoctorWork,
                doctorWork.id,
                {
                    work:JSON.stringify(doctorWork.work),
                    update_time: updateDate,
                },
            );

            await queryRunner.commitTransaction();

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

    //给选中的医生未来29天进行排班
    async doctorWorkScheduling(
        work: { status: number; date: number; register_number: number }[],
        doctorId: number,
        doctorWorkId: number,
    ) {
        try {
            await this.connection.transaction(async (transactionalEntityManager) => {
                // 计算当前日期
                const currentDate = new Date();
                // 删除已经过期的时间,work_time表中，每一个医生只存在有效日期的排班时间
                await transactionalEntityManager.delete(WorkTime, {
                    doctor: { id: doctorId },
                    doctorWork: { id: doctorWorkId },
                    work_time: LessThan(currentDate.toISOString().slice(0, 10)),
                });
                // 创建新的排班数据
                let workTimes = []; // 创建一个数组来存储所有的 WorkTime 对象
                for (let i = 0; i < 29; i++) {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() + i);
                    const dayOfWeek = date.getDay();
                    // getDay 方法返回的值是一个介于 0（周日）和 6（周六）之间的整数，而不是介于 1（周一）和 7（周日）之间的整数
                    // 对 getDay 方法返回的值进行转换成我定义的日期类型，我定义的是周一到周日(0-7)
                    const convertedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
                    let workTime = await transactionalEntityManager.findOne(
                        WorkTime,
                        {
                            where: {
                                doctor: { id: doctorId },
                                doctorWork: { id: doctorWorkId },
                                work_time: date.toISOString().slice(0, 10),
                            },
                        },
                    );
                    const workItem = work.find((item) => item.date === convertedDayOfWeek);
                    if (!workTime) {
                        // 如果没有找到匹配数据，则创建新的排班数据
                        workTime = new WorkTime();
                        workTime.create_time = new Date().toLocaleString('zh-CN', {
                            timeZone: 'Asia/Shanghai',
                        });
                        workTime.doctor = { id: doctorId } as Doctor;
                        workTime.doctorWork = { id: doctorWorkId } as DoctorWork;
                        // 查找医生表中对应的医生数据，并将医生名字赋值给 workTime.name 属性
                        const doctor = await transactionalEntityManager.findOne(
                            Doctor,
                            {
                                where: { id: doctorId },
                            }
                        );
                        if (doctor) {
                            workTime.name = doctor.name;
                        }
                        workTime.work_time = date.toISOString().slice(0, 10); // 设置work_time
                        workTime.status = workItem?.status;
                        workTime.register_number = workItem?.register_number; // 设置register_number
                        workTimes.push(workTime); // 将 WorkTime 对象添加到数组中
                    }
                    // 如果找到了匹配数据，则更新该数据
                    else {
                        workTime.status = workItem?.status;
                        workTime.work_time = date.toISOString().slice(0, 10); // 设置work_time
                        workTime.update_time = new Date().toLocaleString('zh-CN', {
                            timeZone: 'Asia/Shanghai',
                        });
                        workTime.register_number = workItem?.register_number;// 设置register_number
                        workTimes.push(workTime); // 将 WorkTime 对象添加到数组中
                    }
                }
                await transactionalEntityManager.save(workTimes); // 在循环结束后一次性保存所有的 WorkTime 对象
            });
            return { code: 200, message: '排班成功' };
        } catch (error) {
            console.error(error);
            return { code: 402, message: '排班失败' + `${error}` };
        }
    }


    //获取医生的出诊时间
    async searchWorkTime(name: string, page: number, pageSize: number) {
        // 计算要跳过的条目数
        const skip = (page - 1) * pageSize;
        const data = await this.workTimeRepository
            .createQueryBuilder('work_time')
            // .leftJoinAndSelect('work_time.doctor', 'doctor')
            // .leftJoinAndSelect('work_time.doctorWork', 'doctorWork')
            .where('work_time.name LIKE :name', { name: `%${name}%` })
            .skip(skip)
            .take(pageSize)
            .getMany();
        // 查询数据库，获取数据总条目数
        const total = await this.workTimeRepository.count({
            where: { name: Like(`%${name}%`) },
        });
        return { data, total };
    }

    //修改选中的医生的出诊时间
    async changeWorkTime(workTime: WorkTime) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const updateDate = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });
            const res = await queryRunner.manager.update(
                WorkTime,
                workTime.id,
                {
                    status: workTime.status,
                    update_time: updateDate,
                    register_number: workTime.register_number
                },
            );

            await queryRunner.commitTransaction();

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
    //删除选中医生的出诊时间
    async removeWorkTime(id: number) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await queryRunner.manager.delete(WorkTime, id);

            await queryRunner.commitTransaction();

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

    //医生详情页面获取医生的出诊安排id
    async getDoctorWorkId(doctorId: number) {
        const data = await this.doctorWorkRepository
            .createQueryBuilder('doctor_work')
            .where('doctorid = :doctorId', { doctorId })
            .getMany();
        const id = data.map(item => item.id); // 提取 id 字段
        return id;
    }

    //医生详情页面获取医生的出诊时间
    async getDoctorWorkTime(doctorId: number, doctorWorkId: number) {
        const data = await this.workTimeRepository
            .createQueryBuilder('work_time')
            .where('doctorId = :doctorId', { doctorId })
            .where('doctorWorkId = :doctorWorkId', { doctorWorkId })
            .getMany();
        return data;
    }

    //挂号页面获取指定id医生的信息
    async getRegisterDoctor(doctorId: number) {
        const data = await this.doctorRepository.findOne({
            where: {
                id: doctorId
            }
        });
        return data;
    }

    //获取医生的预约数据,匹配就诊人名字/电话
    async searchDoctorAppointment(search: string | number, page: number, pageSize: number) {
        if(search!=""){
        // 尝试将 search 转换为数字
        var searchNumber = Number(search);
        }
        // 如果转换成功，那么 search 是一个电话号码
        if (!isNaN(searchNumber)) {
            search = searchNumber;
            // 计算要跳过的条目数   
            const skip = (page - 1) * pageSize;
            const data = await this.doctorAppointmentRepository
                .createQueryBuilder('doctor_appointment')
                .leftJoinAndSelect('doctor_appointment.doctor', 'doctor')
                .leftJoinAndSelect('doctor_appointment.patient', 'patient')
                .leftJoinAndSelect('doctor_appointment.user_register', 'user_register')
                .where('doctor_appointment.phone LIKE :phone', { phone: `%${search}%` })
                .orderBy('doctor_appointment.create_time', 'DESC')
                .skip(skip)
                .take(pageSize)
                .getMany();
            // 查询数据库，获取数据总条目数
            const total = await this.doctorAppointmentRepository.count({
                where: { phone: Like(`%${search}%`) },
            });
            return { data, total };
        }
        else {
            //search是名字

            // 计算要跳过的条目数   
            const skip = (page - 1) * pageSize;
            const data = await this.doctorAppointmentRepository
                .createQueryBuilder('doctor_appointment')
                .leftJoinAndSelect('doctor_appointment.doctor', 'doctor')
                .leftJoinAndSelect('doctor_appointment.patient', 'patient')
                .leftJoinAndSelect('doctor_appointment.user_register', 'user_register')
                .where('doctor_appointment.patient_name LIKE :patient_name', { patient_name: `%${search}%` })
                .orderBy('doctor_appointment.create_time', 'DESC')
                .skip(skip)
                .take(pageSize)
                .getMany();
            // 查询数据库，获取数据总条目数
            const total = await this.doctorAppointmentRepository.count({
                where: { patient_name: Like(`%${search}%`) },
            });
            return { data, total };
        }

    }

    //患者签到
    async patientSign(doctorAchievement: DoctorAppointment) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 更新匹配的数据
            await queryRunner.manager.getRepository(DoctorAppointment)
                .createQueryBuilder()
                .update(DoctorAppointment)
                .set({
                    update_time: new Date().toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                    }),
                    doctor_status: 1,  // 1表示签到成功
                })
                .where("id = :id", { id: doctorAchievement.id })  // 匹配的条件
                .execute();
            await queryRunner.manager.getRepository(UserRegister)
                .createQueryBuilder()
                .update(UserRegister)
                .set({
                    update_time: new Date().toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                    }),
                    order_status: 3,  // 3表示订单已就诊(签到完成),无法发起退款
                    evaluate_status: false,//订单状态设置为待评价
                    end_message: false,//订单的消息推送设置为未推送
                })
                .where(" id= :id", { id: doctorAchievement.user_register.id })  // 匹配的条件
                .execute();
            await queryRunner.commitTransaction();
            return { code: 200, message: '签到成功' }
        } catch (error) {
            // 如果出现错误，回滚事务
            await queryRunner.rollbackTransaction();
            return { code: 403, message: '签到失败，错误信息：' + error.message };
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }
    }
    //修改患者的预约信息
    async changeDoctorAppointment(doctorAppointment: DoctorAppointment) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // 更新匹配的数据
            await queryRunner.manager.getRepository(DoctorAppointment)
                .createQueryBuilder()
                .update(DoctorAppointment)
                .set({
                    update_time: new Date().toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                    }),
                    status: doctorAppointment.status,
                    doctor_status: doctorAppointment.doctor_status,
                    work_time: doctorAppointment.work_time,
                })
                .where("id = :id", { id: doctorAppointment.id })  // 匹配的条件
                .execute();
            await queryRunner.manager.getRepository(UserRegister)
                .createQueryBuilder()
                .update(UserRegister)
                .set({
                    //根据预约数据的状态，修改对应订单数据的订单状态
                    order_status: this.returnOrderStatus(doctorAppointment.doctor_status)
                })
                .where("id = :id", { id: doctorAppointment.user_register.id })  // 匹配的条件
                .execute();

            await queryRunner.commitTransaction();

            return { code: 200, message: '修改成功' }
        } catch (error) {
            // 如果出现错误，回滚事务
            await queryRunner.rollbackTransaction();
            return { code: 403, message: '失败' + error };
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }
    }
    //根据预约数据的状态，修改对应订单数据的订单状态
    returnOrderStatus(doctorStatus) {
        switch (doctorStatus) {
            case 0: // '待就诊'
                return 1; // '待就诊'
            case 1: // '签到成功'
                return 3; // '已就诊'
            case 2: // '就诊完成'
                return 3; // '已就诊'
            case 3: // '发起退款'
                return 4; // '发起退款'
            case 4: // '退款成功'
                return 6; // '退款成功'
            case 5: // '未就诊'
                return 1; // '待就诊'
            default:
                throw new Error('Invalid status');
        }
    }

    //当前医生的当日挂号数量减一,总挂号数量加一
    async registerNumberReduce(work_time: string, doctor: Doctor) {
        const res = await this.workTimeRepository.findOne({
            where: {
                work_time: work_time,
                doctor: doctor
            }
        })
        const doctors = await this.doctorRepository.findOne({
            where: {
                id: doctor.id
            }
        })
        if (res && doctors) {
            // 减少register_number
            res.register_number -= 1;
            doctors.receive_number += 1;
            // 保存更改
            await this.workTimeRepository.save(res);
            await this.doctorRepository.save(doctors);
        }
    }

    //当前医生的当日挂号数量加一，总挂号数量减一
    async registerNumberIncrease(work_time: string, doctor: Doctor) {
        const res = await this.workTimeRepository.findOne({
            where: {
                work_time: work_time,
                doctor: doctor
            }
        })
        const doctors = await this.doctorRepository.findOne({
            where: {
                id: doctor.id
            }
        })
        if (res && doctors) {
            // 增加register_number
            res.register_number += 1;
            doctors.receive_number -= 1;
            // 保存更改
            await this.workTimeRepository.save(res);
            await this.doctorRepository.save(doctors);
        }
    }

}
