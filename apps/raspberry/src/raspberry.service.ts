import {Injectable} from '@nestjs/common';

@Injectable()
export class RaspberryService {
  getHello(): string {
    return 'Hello World!';
  }
}
