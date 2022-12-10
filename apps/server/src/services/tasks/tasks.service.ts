import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PowerService } from "../power/power.service";

@Injectable()
export class TasksService {
  constructor(@Inject(PowerService) private powerService: PowerService) {}
  @Cron(CronExpression.EVERY_5_MINUTES)
  powerCheck() {
    console.debug("[TasksService] powerCheck");
    this.powerService.check();
  }
}
