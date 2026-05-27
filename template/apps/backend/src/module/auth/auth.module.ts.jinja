import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AccountEntity } from './entity/account.entity';
import { PermissionEntity } from './entity/permission.entity';
import { RoleEntity } from './entity/role.entity';
import { SessionEntity } from './entity/session.entity';
import { VerificationEntity } from './entity/verification.entity';
import { forwardRef, Module, OnModuleInit, Logger } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule as AppConfigModule } from '@config/config.module';
import { TwilioModule } from '@/package/twilio/twilio.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { BetterAuthConfigService } from './service/better-auth-config.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      AccountEntity,
      PermissionEntity,
      RoleEntity,
      SessionEntity,
      VerificationEntity,
    ]),
    AppConfigModule,
    TwilioModule,
    NestMailerModule,
    BetterAuthModule.forRootAsync({
      imports: [
        forwardRef(() => AuthModule),
        MikroOrmModule,
        AppConfigModule,
        TwilioModule,
        NestMailerModule,
      ],
      inject: [BetterAuthConfigService],
      useFactory: (configService: BetterAuthConfigService) => ({
        auth: betterAuth(configService.createAuthConfig()),
        middleware: configService.getAuthMiddleware(),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BetterAuthConfigService],
  exports: [AuthService, BetterAuthConfigService],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);

  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    try {
      const syncResult = await this.authService.instance.api.sync();
      this.logger.log('[RBAC] Sync completed:', syncResult);
    } catch (error) {
      this.logger.log('[RBAC] Sync failed:', error);
    }
  }
}
