import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {networkInterfaces} from "os"

@Injectable()
export class WarmupServiceService implements OnApplicationBootstrap {

    onApplicationBootstrap() {
        console.debug("[WarmupServiceService] onApplicationBootstrap", {});

        const ifConfig = WarmupServiceService.getIfConfig();
        WarmupServiceService.sendToTelegram(ifConfig);
    }

    static getIfConfig(): string {
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
        return "";
    }

    static sendToTelegram(data: string): void {
        console.debug("[WarmupServiceService] sendToTelegram", {});
    }
}
