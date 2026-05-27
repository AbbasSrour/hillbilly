import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { config } from 'dotenv';

config({ path: '.env.test' });

const dbName = process.env.DB_DATABASE ?? 'app_test';

async function createOrm(targetDb: string) {
  return MikroORM.init({
    driver: PostgreSqlDriver,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dbName: targetDb,
    metadataProvider: TsMorphMetadataProvider,
    entities: ['./src/module/**/*.entity.ts'],
    dynamicImportProvider: (id: string) => import(id),
  });
}

export async function setup() {
  const adminOrm = await createOrm('postgres');

  const knex = adminOrm.em.getConnection().getKnex();
  const result = await knex.raw('SELECT 1 FROM pg_database WHERE datname = ?', [dbName]);

  if (result.rows.length === 0) {
    await knex.raw(`CREATE DATABASE "${dbName}"`);
  }

  await adminOrm.close();

  const orm = await createOrm(dbName);

  await orm.em.getConnection().execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await orm.schema.refreshDatabase();
  await orm.close();
}

export async function teardown() {
  const adminOrm = await createOrm('postgres');

  const knex = adminOrm.em.getConnection().getKnex();

  await knex.raw(
    'SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = ? AND pid <> pg_backend_pid()',
    [dbName],
  );

  await knex.raw(`DROP DATABASE IF EXISTS "${dbName}"`);

  await adminOrm.close();
}
