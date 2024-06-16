import { Module } from '@nestjs/common';
import { OtherService } from './other.service';
import{OtherController} from './other.controller'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';
import { HttpModule } from '@nestjs/axios';
import { ComplaintMail } from 'src/mail/entities/complaintMail.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Announcement,ComplaintMail]),
  HttpModule,],
  controllers: [OtherController],
  providers: [OtherService]
})
export class OtherModule {}
