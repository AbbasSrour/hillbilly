import { ExtendedEntityRepository } from '@hillbilly/nest/abstract';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import type { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { PopulateHint, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ThrottlerOptions } from '@nestjs/throttler';
import { isNil } from 'lodash';
import parse from 'parse-duration';

import type { EnvironmentVariables } from '../schema/env.schema';

import unit = parse.unit;

type Units = keyof typeof unit;

@Injectable()
export class ApiConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get appName(): string {
    const domain = this.getString('DOMAIN');
    try {
      const { hostname } = new URL(domain);
      return hostname.split('.')[0]!.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } catch {
      return domain;
    }
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE');
  }

  get throttlerConfigs(): ThrottlerOptions {
    return {
      ttl: this.getDuration('THROTTLER_TTL', 'second'),
      limit: this.getNumber('THROTTLER_LIMIT'),
      // storage: new ThrottlerStorageRedisService(new Redis(this.redis)),
    };
  }

  get mikroOrm(): MikroOrmModuleSyncOptions {
    const connectionType = this.getString('DB_CONNECTION_TYPE') as
      | 'socket'
      | 'tcp';

    const connection =
      connectionType === 'tcp'
        ? {
            host: this.getString('DB_HOST'),
            port: this.getNumber('DB_PORT'),
            user: this.getString('DB_USERNAME'),
            password: this.getString('DB_PASSWORD'),
            dbName: this.getString('DB_DATABASE'),
          }
        : {
            dbName: this.getString('DB_DATABASE'),
            driverOptions: {
              connection: {
                connectionString: `socket://${this.getString('DB_USERNAME')}:${this.getString('DB_PASSWORD')}@${this.getString('DB_SOCKET')}?db=${this.getString('DB_DATABASE')}`,
              },
            },
          };

    return {
      // Connection details
      driver: PostgreSqlDriver,
      name: 'default',
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
        dropTables: this.isTest,
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
      allowGlobalContext: true,
      autoJoinOneToOneOwner: false,
      autoJoinRefsForFilters: false,
      debug: true,
      forceUndefined: true,
      ignoreUndefinedInQuery: true,
      populateWhere: PopulateHint.INFER, // revert to v4 behaviour

      // Required for Vitest - allows MikroORM to properly import .ts files
      // See: https://mikro-orm.io/docs/guide/project-setup#testing-the-endpoint
      ...(this.isTest && {
        dynamicImportProvider: (id: string) => import(id),
      }),
    };
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED');
  }

  get natsConfig() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      encryptionKey: this.getString('ENCRYPTION_KEY'),
      accessTokenExpirationTime: this.getNumber('ACCESS_TOKEN_EXPIRATION_TIME'),
      refreshTokenExpirationTime: this.getNumber(
        'REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    };
  }

  get appConfig() {
    return {
      domain: this.getString('DOMAIN'),
      port: this.getNumber('PORT'),
      apiVersion: this.getString('API_VERSION'),
    };
  }

  get smtpConfig() {
    return {
      host: this.getString('SMTP_HOST'),
      port: this.getNumber('SMTP_PORT'),
      secure: this.getBoolean('SMTP_SECURE'),
      user: this.getString('SMTP_USER'),
      password: this.getString('SMTP_PASSWORD'),
      defaultFrom: this.getString('SMTP_DEFAULT_FROM'),
    };
  }

  get twilioConfig() {
    return {
      accountSid: this.getString('TWILIO_ACCOUNT_SID'),
      authToken: this.getString('TWILIO_AUTH_TOKEN'),
      verifyServiceSid: this.getString('TWILIO_VERIFY_SERVICE_SID'),
    };
  }

  get betterAuthConfig() {
    return {
      secret: this.getString('BETTER_AUTH_SECRET'),
      url: this.getString('BETTER_AUTH_URL'),
    };
  }

  get trustedOrigins(): string[] {
    return this.get('TRUSTED_ORIGINS') as string[];
  }

  private get<K extends keyof EnvironmentVariables>(
    key: K,
  ): EnvironmentVariables[K] {
    const value = this.configService.get(key, { infer: true });

    // probably we should call process.exit() too to avoid locking the service
    if (isNil(value)) {
      throw new TypeError(`${String(key)} environment variable does not set`);
    }

    return value;
  }

  private getNumber<K extends keyof EnvironmentVariables>(key: K): number {
    const value = this.get(key);

    if (typeof value === 'number') {
      return value;
    }

    throw new Error(`${String(key)} environment variable is not a number`);
  }

  private getDuration<K extends keyof EnvironmentVariables>(
    key: K,
    format?: Units,
  ): number {
    const value = this.get(key);
    const duration = parse(String(value), format as string);

    if (!duration) {
      throw new Error(
        `${String(key)} environment variable is not a valid duration`,
      );
    }

    return duration;
  }

  private getBoolean<K extends keyof EnvironmentVariables>(key: K): boolean {
    const value = this.get(key);

    if (typeof value === 'boolean') {
      return value;
    }

    throw new Error(`${String(key)} env var is not a boolean`);
  }

  private getString<K extends keyof EnvironmentVariables>(key: K): string {
    const value = this.get(key);

    if (typeof value === 'string') {
      return value.replaceAll('\\n', '\n');
    }

    throw new Error(`${String(key)} environment variable is not a string`);
  }
}
