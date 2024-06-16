import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Like, Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { ComplaintMail } from 'src/mail/entities/complaintMail.entity';

@Injectable()
export class OtherService {
    constructor(
        private readonly httpService: HttpService,
          //投诉表
          @InjectRepository(ComplaintMail)
          private readonly complaintMailRepository: Repository<ComplaintMail>,
          //公告表
        @InjectRepository(Announcement)
        private readonly announcementRepository: Repository<Announcement>,
            //nest事务
            private connection: Connection,
      ) {}

      // 运维端
    //获取pageSize条公告
    async searchAnnouncemeList(page: number, pageSize: number,title:string) {
                      // 查询数据库，获取数据总条目数
                      const total = await this.announcementRepository.count({
                        where: { title: Like(`%${title}%`) },
                    });
              // 计算要跳过的条目数
              const skip = (page - 1) * pageSize;
              const data = await this.announcementRepository
                  .createQueryBuilder('announcement')
                  .where('announcement.title LIKE :title', { title: `%${title}%` })
                  .orderBy('announcement.create_time', 'DESC')
                  .skip(skip)
                  .take(pageSize)
                  .getMany();

              return { data, total };
  }
      //保存公告
      async saveAnnouncement(announcement:Announcement) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const announcements = new Announcement();
            announcements.title=announcement.title;
            announcements.content=announcement.content;
            announcements.status=announcement.status;
            announcements.create_time = new Date().toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
            });


            const res = await queryRunner.manager.save(announcements);

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
    //删除选中公告
    async removeAnnouncement(id: number) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
          const result = await this.announcementRepository.delete(id);
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

    //修改选中公告的状态
    async changeAnnouncementStatus(id: number, status: boolean) {
      const queryRunner = this.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const updateDate = new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
        });
          const res = await queryRunner.manager.update(
            Announcement,
              id,
              { status: status,
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
    //修改的公告信息
    async changeAnnouncement(announcement: Announcement) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
          const updateDate = new Date().toLocaleString('zh-CN', {
              timeZone: 'Asia/Shanghai',
          });

          const res = await queryRunner.manager.update(
            Announcement,
            announcement.id,
              {
                  status: announcement.status,
                  title: announcement.title,
                  content: announcement.content,
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

  //搜索匹配标题的投诉
  async searchComplaintMail(title: string, page: number, pageSize: number) {
        // 查询数据库，获取数据总条目数
        const total = await this.complaintMailRepository.count({
            where: { title: Like(`%${title}%`) },
          });
    // 计算要跳过的条目数
    const skip = (page - 1) * pageSize;
    const data = await this.complaintMailRepository
      .createQueryBuilder('complaint_mail')
      .where('complaint_mail.title LIKE :title', { title: `%${title}%` })
      .skip(skip)
      .take(pageSize)
      .getMany();

    return { data, total };
  }

      // 微信端
    //获取最新的一条公告
    async getLatestAnnouncement(){
        const latestAnnouncement = await this.announcementRepository.findOne({
            where: {
                status: true
            },
            order: {
                create_time: "DESC"
            }
        });
        return latestAnnouncement;
    }

    //获取通过的公告条数
    async getAnnouncementCount() {
        const count = await this.announcementRepository.count({
          where: {
            status: true
          },
          order: {
            create_time: 'desc'
          }
          
        });
        return count;
      }

    //获取5条通过的公告,hasMore参数表示是否已经查询完所有数据，hasMore为true，表示还有数据，为false则已经查询完所有公告了
    async  getAnnouncement(skip:number,take:number){
        const Announcements=await this.announcementRepository.find({
            where: {
                status: true
            },
            skip,
            take
        });
        const count = await this.announcementRepository.count({
            where: {
              status: true
            },
            order: {
              create_time: 'desc'
            }
            
          });
          const hasMore = skip + take < count;
          return { Announcements, hasMore };
    }
}
