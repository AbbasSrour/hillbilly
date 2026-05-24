/* @hillbilly-sync */
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ApiConfigService } from './service/api-config.service';
import { validateSchema } from './util/validate-config.util';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      validate: validateSchema,
    }),
  ],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ConfigModule {}
