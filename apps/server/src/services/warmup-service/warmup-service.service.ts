import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {networkInterfaces} from "os"
import {InjectBot} from "nestjs-telegraf"
import {Telegraf, Context as TelegrafContext} from "telegraf";

@Injectable()
export class WarmupServiceService implements OnApplicationBootstrap {
    constructor(
        @InjectBot() private bot: Telegraf<TelegrafContext>
    ) {
    }

    onApplicationBootstrap() {
        console.debug("[WarmupServiceService] onApplicationBootstrap", {});

        const ifConfig = this.getIfConfig();
        this.sendToTelegram({
            device: process.env.DEVICE_NAME,
            ...ifConfig
        });
    }

    getIfConfig(): object {
        const nets = networkInterfaces();
        type ResultType = { [r: string]: string[] }
        // const results = Object.create(null); // Or just '{}', an empty object
        const results: ResultType = {}; // Or just '{}', an empty object

        for (const name in nets) {
            const net1 = nets[name];
            if (!net1) continue;
            for (const net of net1) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }

        console.debug("[WarmupServiceService] getIfConfig", {results});
        return results;
    }

    async sendToTelegram(data: object) {
        console.debug("[WarmupServiceService] sendToTelegram", {data});
        const chatId: string | undefined = process.env.TELEGRAM_CHAT_ID;
        if(!chatId) return;
        await this.bot.telegram.sendMessage(chatId || "", JSON.stringify(data), { disable_notification: true });
    }
}
