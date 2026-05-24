/* @hillbilly-sync */
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { PulseController } from "./controller/pulse.controller";
import { ServiceHealthIndicator } from "./service/service.indicator";

@Module({
  imports: [TerminusModule],
  controllers: [PulseController],
  providers: [ServiceHealthIndicator],
})
export class PulseModule {}
