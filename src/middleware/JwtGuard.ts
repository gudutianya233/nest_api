import { Injectable, SetMetadata, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtGuard  implements CanActivate  {
    constructor(private reflector: Reflector,
              private  jwtService: JwtService,
            ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
        ]);
        if (isPublic) {
          // 如果路由是公共的，跳过守卫
          return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) {
          throw new UnauthorizedException('缺少令牌');
        }
        try {
          const payload =await this.jwtService.verifyToken(token);
          if(!payload){
            throw new UnauthorizedException({ message: '无效或过期的令牌', code: 402 });
          }
          request.user = payload; 
        } catch (err) {
          if (err instanceof UnauthorizedException) {
            throw err;
          }
          return false;
        } 
        return true;
  }
}  