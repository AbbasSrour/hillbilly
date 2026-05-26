import { MikroORM } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExtendedEntityRepository } from '@/abstract/repository/abstract-entity.repository';
import { ValidatorService } from '@/package/validation/service/validator.service';
import { UserService } from '../service/user.service';
import { UserEntity } from '../entity/user.entity';
import { UserSettingsEntity } from '../entity/user-settings.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: ExtendedEntityRepository<UserEntity>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const userRepositoryMock = {
      create: vi.fn(),
      persist: vi.fn(),
      flush: vi.fn(),
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      remove: vi.fn(),
      removeAndFlush: vi.fn(),
      createQueryBuilder: vi.fn(),
      nativeDelete: vi.fn(),
    };

    const userSettingsRepositoryMock = {
      create: vi.fn(),
      persist: vi.fn(),
      flush: vi.fn(),
      findOne: vi.fn(),
      assign: vi.fn(),
    };

    const validatorServiceMock = {
      isImage: vi.fn(),
    };

    const ormMock = {
      em: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserSettingsEntity),
          useValue: userSettingsRepositoryMock,
        },
        {
          provide: ValidatorService,
          useValue: validatorServiceMock,
        },
        {
          provide: MikroORM,
          useValue: ormMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user with populated relations', async () => {
      const findData = { email: 'test@example.com' };
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(userRepository.findOne).mockResolvedValue(mockUser as UserEntity);

      const result = await service.findOne(findData);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith(findData, {
        populate: ['role', 'settings'],
      });
    });

    it('should return null when user is not found', async () => {
      const findData = { email: 'nonexistent@example.com' };
      vi.mocked(userRepository.findOne).mockResolvedValue(null);

      const result = await service.findOne(findData);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith(findData, {
        populate: ['role', 'settings'],
      });
    });
  });
});