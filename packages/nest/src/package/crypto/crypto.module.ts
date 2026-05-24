import { DynamicModule, Global, Module } from "@nestjs/common";

import { CRYPTO_MODULE_OPTIONS } from "./crypto.constants";
import type { CryptoModuleAsyncOptions, CryptoModuleOptions } from "./crypto-options.interface";
import { CryptoService } from "./service/crypto.service";

@Global()
@Module({})
export class CryptoModule {
  static forRoot(options: CryptoModuleOptions): DynamicModule {
    return {
      module: CryptoModule,
      providers: [{ provide: CRYPTO_MODULE_OPTIONS, useValue: options }, CryptoService],
      exports: [CryptoService],
    };
  }

  static forRootAsync(options: CryptoModuleAsyncOptions): DynamicModule {
    return {
      module: CryptoModule,
      imports: options.imports,
      providers: [
        {
          provide: CRYPTO_MODULE_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        CryptoService,
      ],
      exports: [CryptoService],
    };
  }
}
