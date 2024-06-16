import { Doctor } from "./doctor.entity";
import { DoctorProficientTreatment } from "./doctor.proficient_treatment.entity";
import { DoctorAchievement } from "./doctor_achievement.entity";
import { DoctorHonor } from "./doctor_honor.entity";

export class DoctorInfo{
    doctorHonor: DoctorHonor[];
    doctorAchievement: DoctorAchievement[];
    doctorProficientTreatment: DoctorProficientTreatment[];
    doctor: Doctor;
    constructor(
        doctorHonor: DoctorHonor[],
        doctorAchievement: DoctorAchievement[],
        doctorProficientTreatment: DoctorProficientTreatment[],
        doctor: Doctor
      ) {
        this.doctorHonor = doctorHonor;
        this.doctorAchievement = doctorAchievement;
        this.doctorProficientTreatment = doctorProficientTreatment;
        this.doctor = doctor;
      }
}