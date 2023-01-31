import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {Socket, createSocket, RemoteInfo} from 'dgram';
import * as os from 'os';
import {LoggerService} from '../../core/logger/logger.service';

@Injectable()
export class UdpService implements OnModuleInit {
  private socket: Socket;
  public ipAddress = '';
  private _listeners: Array<Function> = [];

  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.socket = createSocket('udp4');

    this.logger.log('[UdpService] created');
  }

  addListener(listener: Function) {
    this._listeners.push(listener);
  }

  listen() {
    this.logger.info('[UdpService] listen');
    const port = process.env.NODE_ENV === 'test' ? 41235 : 41234;
    this.socket.bind(port);
    this.socket.on('message', (msg: string, rinfo: RemoteInfo) => {
      this._listeners.forEach(listener => listener(msg, rinfo));
    });
  }

  emit(event: string, msg: Buffer, rinfo?: RemoteInfo) {
    this.socket.emit(event, msg, rinfo);
  }

  send(msg: string, port: number, address: string) {
    this.socket.send(Buffer.from(msg), port, address);
  }

  removeListener(listener: Function) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  close() {
    this.logger.info('[UdpService] closing');
    this.socket.close();
  }

  onModuleInit(): void {
    this.getIPAddress();
    this.listen();
  }

  // refactored method to determine current IP address
  private getIPAddress(): string {
    const interfaces = os.networkInterfaces();
    let address = '';
    for (const devName in interfaces) {
      const iface = interfaces[devName];

      iface?.forEach(alias => {
        if (
          alias.family === 'IPv4' &&
          alias.address !== '' &&
          !alias.internal
        ) {
          address = alias.address;
        }
      });
    }
    this.ipAddress = address;
    return address;
  }
}
