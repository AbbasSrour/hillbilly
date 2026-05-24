import { MikroORM } from "@mikro-orm/core";
import type { INestApplication } from "@nestjs/common";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";

// TODO: Import your exception filters when they exist
// import { HttpExceptionFilter } from "../src/filter/bad-request.filter";
// import { UniqueConstraintViolationFilter } from "../src/filter/unique-constraint.filter";

// TODO: Use your actual AppModule
// import { AppModule } from "../src/app.module";

import { AppModule } from "../../src/app.module";

export interface TestApp {
  app: INestApplication;
  orm: MikroORM;
  moduleFixture: TestingModule;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const orm = moduleFixture.get(MikroORM);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix("/api");
  app.enableVersioning({ type: VersioningType.URI });

  // TODO: Add your exception filters when they exist
  // app.useGlobalFilters(
  //   new HttpExceptionFilter(reflector),
  //   new UniqueConstraintViolationFilter(reflector),
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.init();

  // TODO: Wire Better Auth handler when auth module is in place
  // import { AuthService } from "@thallesp/nestjs-better-auth";
  // import { toNodeHandler } from "better-auth/node";
  // const authService = app.get(AuthService).instance;
  // app.getHttpAdapter().getInstance().all("/api/auth/*splat", toNodeHandler(authService));

  return { app, orm, moduleFixture };
}

export async function closeTestApp(testApp: TestApp): Promise<void> {
  if (testApp.app) {
    await testApp.app.close();
  }
}
