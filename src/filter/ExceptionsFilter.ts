import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = fs.createWriteStream(path.join(__dirname,'..', '..', 'log', 'exceptions.log'), { flags: 'a' });

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      path: request.url,
      message: exception['message'] || null,
      stackTrace: exception['stack'],
    };

    this.logger.write(`[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] ${JSON.stringify(errorResponse)}\n`);

    response.status(status).json(errorResponse);
  }
}
