import * as crypto from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";

import { CRYPTO_MODULE_OPTIONS } from "../crypto.constants";
import type { CryptoModuleOptions } from "../crypto-options.interface";

@Injectable()
export class CryptoService {
  public IV_LENGTH = 16;
  public ALGORITHM = "aes-256-cbc";
  private key!: Buffer;

  constructor(@Inject(CRYPTO_MODULE_OPTIONS) private readonly options: CryptoModuleOptions) {}

  public async encrypt(value: string): Promise<string> {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = this.getKey();

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  public async decrypt(value: string): Promise<string> {
    const [iv, encrypted] = value.split(":").map((part) => Buffer.from(part, "hex")) as [
      Buffer,
      Buffer,
    ];

    const key = this.getKey();

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString();
  }

  private getKey(): Buffer {
    if (!this.key) {
      const baseKey = this.options.encryptionKey;
      this.key = crypto.createHash("sha256").update(baseKey).digest();
    }

    return this.key;
  }
}
