import {Inject, Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {PowerService} from "../power/power.service";

@Injectable()
export class WarmupService implements OnApplicationBootstrap {
    constructor(
        @Inject(PowerService) private powerService: PowerService
    ) {
    }

    onApplicationBootstrap() {
        console.debug("[WarmupServiceService] onApplicationBootstrap", {});

        this.powerService.check(); // if it is used by cron, not sure, that it is needed on boot
    }
}
