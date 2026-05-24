import type { ModuleMetadata, Type } from "@nestjs/common";

export interface CryptoModuleOptions {
  encryptionKey: string;
}

export interface CryptoModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: Array<string | symbol | Type<unknown>>;
  useFactory: (...args: unknown[]) => CryptoModuleOptions | Promise<CryptoModuleOptions>;
}
