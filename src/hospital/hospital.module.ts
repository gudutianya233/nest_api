import { Module } from '@nestjs/common';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { HospitalHonor } from './entities/hospital_honor.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([HospitalHonor]),
  HttpModule,],
  controllers: [HospitalController],
  providers: [HospitalService]
})
export class HospitalModule {}
