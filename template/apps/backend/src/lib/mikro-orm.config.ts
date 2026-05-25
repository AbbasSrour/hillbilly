import { ExtendedEntityRepository } from '@/abstract';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { Options } from '@mikro-orm/postgresql';
import { PopulateHint, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const connectionType = process.env.DB_CONNECTION_TYPE as 'socket' | 'tcp';

const connection =
  connectionType === 'tcp'
    ? {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_DATABASE,
      }
    : {
        dbName: process.env.DB_DATABASE,
        driverOptions: {
          connection: {
            connectionString: `socket://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_SOCKET}?db=${process.env.DB_DATABASE}`,
          },
        },
      };

const config: Options = {
  // Connection details
  name: 'default',
  driver: PostgreSqlDriver,
  driverOptions: {
    ...connection.driverOptions,
  },
  ...connection,

  // Entity configuration
  entityRepository: ExtendedEntityRepository,
  entities: [
    './dist/module/**/*.entity.js',
    './dist/module/**/entity/*.entity.js',
  ],
  entitiesTs: [
    './src/module/**/*.entity.ts',
    './src/module/**/entity/*.entity.ts',
  ],
  metadataProvider: TsMorphMetadataProvider,

  // Extensions and tools
  extensions: [Migrator, EntityGenerator, SeedManager],
  seeder: {
    path: './dist/database/seed',
    pathTs: './src/database/seed',
    defaultSeeder: 'DatabaseSeeder',
  },
  migrations: {
    transactional: true,
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    glob: '!(*.d).{js,ts}',
    dropTables: isTest,
    generator: TSMigrationGenerator,
    allOrNothing: true,
    safe: true,
    emit: 'ts',
  },
  discovery: {
    warnWhenNoEntities: true,
    checkDuplicateTableNames: true,
    checkDuplicateFieldNames: true,
  },

  // Behavior settings
  autoJoinOneToOneOwner: false,
  autoJoinRefsForFilters: false,
  debug: true,
  forceUndefined: true,
  ignoreUndefinedInQuery: true,
  populateWhere: PopulateHint.INFER, // revert to v4 behaviour
};

export default config;
