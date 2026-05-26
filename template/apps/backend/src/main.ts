import { HttpExceptionFilter } from '@/filter/bad-request.filter';
import { UniqueConstraintViolationFilter } from '@/filter/unique-constraint.filter';
import { TranslationInterceptor } from '@/interceptor/translation.interceptor';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { ConfigModule } from '@config/config.module';
import { ApiConfigService } from '@config/service/api-config.service';
import { TranslationService } from '@/package/translation/service/translation.service';
import { TranslationModule } from '@/package/translation/translation.module';
import { setupInstrumentation } from '@/lib/instrumentation.config';
import { setupOpenapi } from '@/lib/openapi.config';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from 'better-auth';
import { toNodeHandler } from 'better-auth/node';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './app.module';

setupInstrumentation();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
    cors: true,
    bodyParser: false,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Security
  app.enable('trust proxy');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  app.setGlobalPrefix('/api');
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new UniqueConstraintViolationFilter(reflector),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TranslationInterceptor(app.select(TranslationModule).get(TranslationService)),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );
  const configService = app.select(ConfigModule).get(ApiConfigService);

  if (configService.natsEnabled) {
    const natsConfig = configService.natsConfig;
    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        url: `nats://${natsConfig.host}:${natsConfig.port}`,
        queue: 'main_service',
      },
    });
  }

  if (configService.documentationEnabled) {
    await setupOpenapi(app);
  }

  // Manually register Better Auth handler
  // This is a workaround for better-auth 1.4.6+ route matching issues
  // See: https://github.com/better-auth/better-auth/issues/6636
  const authService = app.get(AuthService).instance;
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(authService as Auth));

  // Starts listening for shutdown hooks
  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  const port = configService.appConfig.port;
  await app.listen(port);

  console.info(`server running on ${await app.getUrl()}`);
}

void bootstrap();
