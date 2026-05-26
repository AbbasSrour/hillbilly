import { Global, Module } from '@nestjs/common';

import { ValidatorService } from './service/validator.service';

@Global()
@Module({
  providers: [ValidatorService],
  exports: [ValidatorService],
})
export class ValidationModule {}
