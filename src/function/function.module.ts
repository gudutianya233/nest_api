import { Module } from '@nestjs/common';
import { FunctionService } from './function.service';
import { FunctionController } from './function.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommondAbility } from './entities/commondAbility.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CommondAbility]),
  HttpModule,],
  providers: [FunctionService],
  controllers: [FunctionController]
})
export class FunctionModule {}
