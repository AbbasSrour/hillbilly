import { MikroORM } from '@mikro-orm/core';
import type { TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import request from 'supertest';

// TODO: Import your entities when auth/user modules are in place
// import { UserEntity } from "../../src/module/user/entity/user.entity";
// import { AccountEntity } from "../../src/module/auth/entity/account.entity";

export interface TestUser {
  // TODO: Replace with your actual UserEntity type
  user: Record<string, unknown>;
  cookie: string;
}

export interface CreateTestUserOptions {
  email?: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  banned?: boolean;
}

const TEST_PASSWORD = 'TestPassword123!';

export async function createTestUser(
  orm: MikroORM,
  _moduleFixture: TestingModule,
  options: CreateTestUserOptions = {},
  app?: INestApplication,
): Promise<TestUser> {
  const em = orm.em.fork();

  const email = options.email ?? `test-${crypto.randomUUID()}@test.com`;
  const name = options.name ?? 'Test User';

  // TODO: Replace with actual UserEntity + AccountEntity creation
  // const user = em.create(UserEntity, { email, name, ... });
  // await em.persistAndFlush(user);

  throw new Error(
    'createTestUser not implemented — add UserEntity and AccountEntity to the template first.',
  );
}

export async function createTestAdmin(
  orm: MikroORM,
  moduleFixture: TestingModule,
  options: Omit<CreateTestUserOptions, 'role'> = {},
  app?: INestApplication,
): Promise<TestUser> {
  return createTestUser(orm, moduleFixture, { ...options, role: 'admin' }, app);
}

export async function createTestMember(
  orm: MikroORM,
  moduleFixture: TestingModule,
  options: Omit<CreateTestUserOptions, 'role'> = {},
  app?: INestApplication,
): Promise<TestUser> {
  return createTestUser(orm, moduleFixture, { ...options, role: 'user' }, app);
}

export { TEST_PASSWORD };
