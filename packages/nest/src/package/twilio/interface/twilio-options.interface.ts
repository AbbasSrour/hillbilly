import type { ModuleMetadata, Type } from "@nestjs/common";

export interface TwilioModuleOptions {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
}

export interface TwilioModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: Array<string | symbol | Type<unknown>>;
  useFactory: (...args: unknown[]) => TwilioModuleOptions | Promise<TwilioModuleOptions>;
}
