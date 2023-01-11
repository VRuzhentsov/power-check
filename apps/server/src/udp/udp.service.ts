import {Inject, Injectable} from '@nestjs/common';
import {Socket, createSocket} from 'dgram';
import {LoggerService} from '../core/logger/logger.service';

@Injectable()
export class UdpService {
  private socket: Socket;
  private _listeners: Array<Function> = [];

  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.socket = createSocket('udp4');

    this.listen();
    this.logger.log('[UdpService] created');
  }

  addListener(listener: Function) {
    this._listeners.push(listener);
  }

  listen() {
    this.socket.bind(41234);
    this.socket.on('message', (msg: string, rinfo: Object) => {
      this._listeners.forEach(listener => listener(msg, rinfo));
    });
  }

  removeListener(listener: Function) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }
}
