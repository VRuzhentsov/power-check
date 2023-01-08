import {Injectable} from '@nestjs/common';
import pino from 'pino';
import {ILoggerPayload, ILoggerErrorPayload} from './interfaces';

@Injectable()
export class LoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    this.logger = pino();
  }

  log(payload: ILoggerPayload) {
    this.logger.debug(payload.message, {...payload});
  }

  debug(payload: ILoggerPayload) {
    this.logger.debug(payload.message, {...payload});
  }

  error(payload: ILoggerErrorPayload) {
    this.logger.error(payload.message, payload.trace, {...payload});
  }
}
