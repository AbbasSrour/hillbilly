import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '@config/service/api-config.service';

@Injectable()
export class CryptoService {
  public IV_LENGTH = 16;
  public ALGORITHM = 'aes-256-cbc';
  private key: Buffer;

  public async encrypt(value: string): Promise<string> {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = this.getKey();

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  public async decrypt(value: string): Promise<string> {
    const [iv, encrypted] = value.split(':').map((part) => Buffer.from(part, 'hex'));

    if (!iv || !encrypted) {
      throw new Error('Invalid encrypted value');
    }

    const key = this.getKey();

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString();
  }

  private getKey(): Buffer {
    if (!this.key) {
      const baseKey = process.env.ENCRYPTION_KEY || '';
      this.key = crypto.createHash('sha256').update(baseKey).digest();
    }

    return this.key;
  }
}
