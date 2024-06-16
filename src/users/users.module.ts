import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CommonFunctions } from './entities/commonFunctions.entity';
import { UserFollow } from './entities/user.follow.entity';
import { UserEvaluate } from './entities/user_evaluate.entity';
import { PatientsCard } from './entities/patients_card.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { UserRegister } from './entities/user_register.entity';
import { DoctorAppointment } from 'src/doctor/entities/doctor_appointment.entity';
import { JsapiTicket } from 'src/wechat_api/entities/Jsapi_ticket.entity';
import { WeChatModule } from 'src/wechat_api/wechat.module';
import { DoctorAssistant } from 'src/doctor/entities/doctor_assistant.entity';
import { SystemUser } from './entities/system_user.entity';
import { DoctorModule } from 'src/doctor/doctor.module';
import { MailModule } from 'src/mail/mail.module';
import { UserAdmin } from './entities/user_admin.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,CommonFunctions,UserFollow,UserEvaluate,
    PatientsCard,Doctor,UserRegister,DoctorAppointment,JsapiTicket,DoctorAssistant,SystemUser,UserAdmin]),
  HttpModule,WeChatModule,DoctorModule,MailModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
