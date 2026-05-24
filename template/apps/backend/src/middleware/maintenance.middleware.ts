/* @hillbilly-sync */
import { Injectable, NestMiddleware, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const isMaintenanceMode = this.configService.get<string>("MAINTENANCE") === "true";

    if (isMaintenanceMode) {
      throw new ServiceUnavailableException(
        "The service is under maintenance. Please try again later.",
      );
    }

    next();
  }
}
