import { Test, type TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll } from 'vite-plus/test';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let app: TestingModule;
  let controller: AuthController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [],
      imports: [],
    }).compile();

    controller = app.get<AuthController>(AuthController);
  });

  describe('controller', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });
});
