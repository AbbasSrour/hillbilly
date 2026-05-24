import { BetterAuthConfigService } from '../service/better-auth-config.service';
import { UserEntity } from '../../user/entity/user.entity';
import { Auth } from 'better-auth';

export type BetterAuthInstance = Auth<
  ReturnType<BetterAuthConfigService['createAuthConfig']>
>;

export type AuthSession = BetterAuthInstance['$Infer']['Session'];

export type SessionUser = AuthSession['user'] & UserEntity;
