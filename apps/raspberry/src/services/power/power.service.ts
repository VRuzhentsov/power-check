import {Injectable} from '@nestjs/common';
import {networkInterfaces} from 'os';
import {InjectBot} from 'nestjs-telegraf';
import {Telegraf} from 'telegraf';
import {Context as TelegrafContext} from 'telegraf/typings/context.js';
import WifiCore from 'node-wifi';
import * as process from 'process';
import {formatDuration, intervalToDuration} from 'date-fns';
import {DEVICES} from '../../consts/devices';

type WifiSource = {
  device: string | undefined;
  bootTime: Date;
  lastOnline: Date;
  ip: string;
  wifiNameSsid?: string;
  mac?: string;
  rest?: object;
};

@Injectable()
export class PowerService {
  private chatId: string | undefined = process.env.TELEGRAM_CHAT_ID;

  private lastMessage: {message_id: number | undefined; text: string} = {
    message_id: undefined,
    text: '',
  };

  private data: WifiSource = {
    device: process.env.DEVICE_NAME,
    bootTime: new Date(),
    lastOnline: new Date(),
    ip: '',
  };

  private bootTime: Date = new Date();

  private wifi = WifiCore;

  constructor(@InjectBot() private bot: Telegraf<TelegrafContext>) {
    this.wifi.init({
      iface: null,
    });
  }

  async initCheck() {
    await this.check();
  }

  private static dataParse(data: WifiSource): string {
    return [
      `Boot time: ${data.bootTime.toLocaleString()}`,
      `Last online: ${data.lastOnline.toLocaleString()}`,
      `Online duration: ${formatDuration(
        intervalToDuration({start: data.bootTime, end: data.lastOnline})
      )}`,
      `Device: ${data.device}`,
      `WIFI: ${data.wifiNameSsid}`,
      `IP: ${data.ip}`,
    ].join('\n');
  }

  async check() {
    console.debug('[PowerService] check', {});
    const ifConfig = this.getIfConfig();

    const dataSource: WifiSource = {
      device: process.env.DEVICE_NAME,
      bootTime: this.bootTime,
      lastOnline: new Date(),
      ip: JSON.stringify(ifConfig),
      wifiNameSsid: '',
      mac: '',
    };

    await new Promise(resolve => {
      this.wifi.getCurrentConnections((error, currentConnections) => {
        if (error) {
          console.error(error);
          return;
        }
        dataSource.wifiNameSsid =
          currentConnections[0]?.ssid + ' | ' + currentConnections[0]?.bssid;
        dataSource.mac =
          currentConnections[0]?.mac + ' | ' + currentConnections[0]?.mode;
        dataSource.rest = currentConnections;
        console.debug('[PowerService] wifi getCurrentConnections', {
          currentConnections,
        });
        resolve(true);
      });
    });

    this.data = dataSource;

    if (process.env.DEVICE_NAME !== DEVICES.RASPBERRY) {
      console.debug(
        '[PowerService] PC output send',
        PowerService.dataParse(this.data)
      );
      return;
    }
    if (this.lastMessage?.message_id) {
      await this.updateLastMessage(this.lastMessage.message_id);
    } else {
      await this.sendToTelegram(this.data);
    }
  }

  getIfConfig(): object {
    const nets = networkInterfaces();
    type ResultType = {[r: string]: string[]};
    // const results = Object.create(null); // Or just '{}', an empty object
    const results: ResultType = {}; // Or just '{}', an empty object

    for (const name in nets) {
      const net1 = nets[name];
      if (!net1) continue;
      for (const net of net1) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
        if (net.family === familyV4Value && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }

    // console.debug("[PowerService] getIfConfig", {results});
    return results;
  }

  async sendToTelegram(data: WifiSource) {
    if (!this.chatId) return;
    const msg = await this.bot.telegram.sendMessage(
      this.chatId || '',
      PowerService.dataParse(data),
      {disable_notification: true}
    );
    console.debug('[PowerService] sendToTelegram', {data});
    this.lastMessage = msg;
  }

  async updateLastMessage(messageId: number) {
    console.debug('[PowerService] updateLastMessage', {messageId});
    const text = PowerService.dataParse(this.data);
    if (text === this.lastMessage.text) return;
    await this.bot.telegram.editMessageText(
      this.chatId,
      this.lastMessage.message_id,
      undefined,
      text
    );
  }
}
