import '@/utils/boilerplate.polyfill';

import * as path from 'node:path';

import { MikroORM } from '@mikro-orm/core';
import { MikroOrmMiddleware, MikroOrmModule } from '@mikro-orm/nestjs';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { MaintenanceMiddleware } from '@/middleware';

import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AuthModule } from '@module/auth/auth.module';
import { UserModule } from '@module/user/user.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule as AppConfigModule } from '@config/config.module';
import { ApiConfigService } from '@config/service/api-config.service';
import { CryptoModule } from '@/package/crypto';
import { TranslationModule } from '@/package/translation';
import { TwilioModule } from '@/package/twilio';
import { ValidationModule } from '@/package/validation';
import { PulseModule } from '@/package/pulse';

@Module({
  imports: [
    AppConfigModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      imports: [AppConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => configService.mikroOrm,
    }),
    CqrsModule,
    CryptoModule,
    I18nModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          path: path.join(import.meta.dirname, 'i18n/locale'),
          watch: configService.isDevelopment,
        },
        typesOutputPath: path.join(
          import.meta.dirname,
          './i18n/generated/i18n.generated',
        ),
      }),
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang'],
        },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    TranslationModule,
    TwilioModule,
    ValidationModule,
    PulseModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => ({
        throttlers: [configService.throttlerConfigs],
      }),
    }),
    MulterModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ApiConfigService],
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    NestMailerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) => ({
        transport: {
          host: configService.smtpConfig.host,
          port: configService.smtpConfig.port,
          secure: configService.smtpConfig.secure,
          auth: {
            user: configService.smtpConfig.user,
            pass: configService.smtpConfig.password,
          },
        },
        defaults: {
          from: configService.smtpConfig.defaultFrom,
        },
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintenanceMiddleware, MikroOrmMiddleware)
      .forRoutes('*path');
  }
}
