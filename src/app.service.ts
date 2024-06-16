import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
   getHellos(): string {
    return 'Hello World!';
  }

}
