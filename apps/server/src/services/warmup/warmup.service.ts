import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { PowerService } from "../power/power.service";

@Injectable()
export class WarmupService implements OnApplicationBootstrap {
  constructor(@Inject(PowerService) private powerService: PowerService) {}

  async onApplicationBootstrap() {
    console.debug("[WarmupServiceService] onApplicationBootstrap", {});

    await this.powerService.initCheck();
  }
}
