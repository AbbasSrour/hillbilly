import { DynamicModule, Global, Module } from "@nestjs/common";

import { TwilioService } from "./service/twilio.service";
import { TWILIO_MODULE_OPTIONS } from "./constant/twilio.constants";
import type {
  TwilioModuleAsyncOptions,
  TwilioModuleOptions,
} from "./interface/twilio-options.interface";

@Global()
@Module({})
export class TwilioModule {
  static forRoot(options: TwilioModuleOptions): DynamicModule {
    return {
      module: TwilioModule,
      providers: [{ provide: TWILIO_MODULE_OPTIONS, useValue: options }, TwilioService],
      exports: [TwilioService],
    };
  }

  static forRootAsync(options: TwilioModuleAsyncOptions): DynamicModule {
    return {
      module: TwilioModule,
      imports: options.imports,
      providers: [
        {
          provide: TWILIO_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        TwilioService,
      ],
      exports: [TwilioService],
    };
  }
}
