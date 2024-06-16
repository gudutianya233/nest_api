import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtController } from './jwt.controller';
import * as crypto from 'crypto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUser } from 'src/users/entities/system_user.entity';
@Module({
  imports:  [TypeOrmModule.forFeature([SystemUser])],
  providers: [JwtService,
    {
      provide: 'CRYPTO',
      useValue: crypto,
    },
  ],
  controllers: [JwtController],
  exports: [JwtService], // 导出JwtService，以便其他模块可以使用
})
export class JwtModules {}