import { Module } from '@nestjs/common';
import { SwiperImageService } from './swiperImage.service';
import { SwiperImageController } from './swiperImage.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwiperImage } from './entities/swiperImage.entity';

@Module({
  imports:[TypeOrmModule.forFeature([SwiperImage]),
  HttpModule,],
  providers: [SwiperImageService],
  controllers: [SwiperImageController]
})
export class SwiperImageModule {}
