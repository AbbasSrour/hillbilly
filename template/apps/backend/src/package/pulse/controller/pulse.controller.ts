import { Controller, Get } from "@nestjs/common";
import type { HealthCheckResult } from "@nestjs/terminus";
import { HealthCheck, HealthCheckService, MikroOrmHealthIndicator } from "@nestjs/terminus";

import { ApiTags } from "@nestjs/swagger";
import { ServiceHealthIndicator } from "../service/service.indicator";

@ApiTags("Pulse")
@Controller("pulse")
export class PulseController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly ormIndicator: MikroOrmHealthIndicator,
    private readonly serviceIndicator: ServiceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.ormIndicator.pingCheck("database", { timeout: 1500 }),
      () => this.serviceIndicator.isHealthy("search-service-health"),
    ]);
  }
}
