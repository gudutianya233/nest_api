import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorHonor } from './entities/doctor_honor.entity';
import { DoctorProficientTreatment } from './entities/doctor.proficient_treatment.entity';
import { DoctorAchievement } from './entities/doctor_achievement.entity';
import { MedicineKnowledge } from './entities/medicine_knowledge.entity';
import { WorkTime } from './entities/work_time.entity';
import { DoctorWork } from './entities/doctor_work.entity';
import { DoctorAppointment } from './entities/doctor_appointment.entity';
import { DoctorAssistant } from './entities/doctor_assistant.entity';

@Module({
  imports:[TypeOrmModule.forFeature([DoctorHonor,DoctorAchievement,DoctorProficientTreatment,
    Doctor,MedicineKnowledge,WorkTime,DoctorWork,DoctorAppointment,DoctorAssistant]),
    ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports:[DoctorService]
})
export class DoctorModule {}
