import { Injectable } from '@nestjs/common';
import {networkInterfaces} from "os";
import {InjectBot} from "nestjs-telegraf";
import {Telegraf} from "telegraf";
import {Context as TelegrafContext} from "telegraf/typings/context.js";

@Injectable()
export class PowerService {
    private chatId: string|undefined = process.env.TELEGRAM_CHAT_ID;

    private lastMessage: {message_id: number, text: string};

    private data: object;

    constructor(@InjectBot() private bot: Telegraf<TelegrafContext>) {
    }
    async check() {
        console.debug("[PowerService] check", {});
        const ifConfig = this.getIfConfig();


        if(this.lastMessage?.message_id) {
            await this.updateLastMessage(this.lastMessage.message_id);
        } else {
            this.data = {
                device: process.env.DEVICE_NAME,
                ...ifConfig
            }
            await this.sendToTelegram(this.data);

        }
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

        // console.debug("[PowerService] getIfConfig", {results});
        return results;
    }

    async sendToTelegram(data: object) {
        if(!this.chatId) return;
        const msg = await this.bot.telegram.sendMessage(this.chatId || "", JSON.stringify(data), {disable_notification: true});
        console.debug("[PowerService] sendToTelegram", {data});
        this.lastMessage = msg;
    }

    async updateLastMessage(messageId: number) {
        console.debug("[PowerService] updateLastMessage", {messageId});
        if(JSON.stringify(this.data) === this.lastMessage.text) return;
        await this.bot.telegram.editMessageText(this.chatId, this.lastMessage.message_id, undefined, JSON.stringify(this.data));
    }
}
