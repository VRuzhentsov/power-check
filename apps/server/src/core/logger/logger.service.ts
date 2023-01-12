import {Injectable} from '@nestjs/common';
import pino from 'pino';
import {ILoggerPayload, ILoggerErrorPayload} from './interfaces';

@Injectable()
export class LoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino();
  }

  log(message: string, payload?: ILoggerPayload) {
    this.info(message, payload);
  }

  info(message: string, payload?: ILoggerPayload) {
    this.logger.info({...payload}, message);
  }

  debug(message: string, payload?: ILoggerPayload) {
    this.logger.debug({...payload}, message);
  }

  error(message: string, payload?: ILoggerErrorPayload) {
    this.logger.error({...payload}, message);
  }
}
