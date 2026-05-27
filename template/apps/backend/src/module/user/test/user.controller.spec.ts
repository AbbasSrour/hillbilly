import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { PermissionGuard } from '@/guard/permission.guard';
import { UserService } from '../service/user.service';
import { ApiConfigService } from '@config/service/api-config.service';
import { TranslationService } from '@/package/translation/service/translation.service';
import { UserController } from '../controller/user.controller';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersPageOptionsDto } from '../dto/users-page-options.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';
import { UserEntity } from '../entity/user.entity';
import { RoleType } from '@constant/role-type.constant';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUserService = {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      getUser: vi.fn(),
      updateUser: vi.fn(),
      updateCurrentUser: vi.fn(),
      blockUser: vi.fn(),
      unblockUser: vi.fn(),
      deleteUser: vi.fn(),
    };

    mockTranslationService = {
      translate: vi.fn(),
    };

    const apiConfigServiceMock = {
      appConfig: {
        accessControlModel: 'STATIC_ROLES',
      },
    };

    const reflectorMock = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
        {
          provide: ApiConfigService,
          useValue: apiConfigServiceMock,
        },
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const pageOptions = { page: 1, limit: 10 } as any;
      const filters = {} as UserFiltersDto;
      const mockUser = { id: 'user-123' } as UserEntity;
      const mockItems = { toPageDto: vi.fn().mockReturnValue([{ id: '1' }]) };
      const mockPageMeta = { page: 1, limit: 10, total: 1 };
      mockUserService.getUsers.mockResolvedValue([mockItems, mockPageMeta]);

      // Act
      const result = await controller.getUsers(pageOptions, filters, mockUser);

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(pageOptions, filters, mockUser);
      expect(mockItems.toPageDto).toHaveBeenCalledWith(mockPageMeta);
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: { name: RoleType.USER },
      } as any;
      const mockCreatedUser = {
        id: '123',
        ...(dto as any),
        toDto: vi.fn().mockReturnValue({ id: '123', email: 'test@example.com' }),
      };
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await controller.createUser(dto);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '123', email: 'test@example.com' });
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      // Arrange
      const userId = '123' as Uuid;
      const mockUserById = {
        id: userId,
        email: 'test@example.com',
        toDto: vi.fn().mockReturnValue({ id: userId, email: 'test@example.com' }),
      };
      mockUserService.getUser.mockResolvedValue(mockUserById);

      // Act
      const result = await controller.getUser(userId);

      // Assert
      expect(mockUserService.getUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ id: userId, email: 'test@example.com' });
    });
  });

  describe('updateUser', () => {
    it('should update and return a user', async () => {
      // Arrange
      const userId = '123' as Uuid;
      const dto: UpdateUserDto = { email: 'updated@example.com' };
      const mockUpdatedUser = {
        id: userId,
        email: 'updated@example.com',
        toDto: vi.fn().mockReturnValue({ id: userId, email: 'updated@example.com' }),
      };
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await controller.updateUser(userId, dto);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual({ id: userId, email: 'updated@example.com' });
    });
  });

  describe('blockUser', () => {
    it('should block a user', async () => {
      // Arrange
      const userId = '123' as Uuid;
      mockUserService.blockUser.mockResolvedValue(undefined);

      // Act
      await controller.blockUser(userId);

      // Assert
      expect(mockUserService.blockUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', async () => {
      // Arrange
      const userId = '123' as Uuid;
      mockUserService.unblockUser.mockResolvedValue(undefined);

      // Act
      await controller.unblockUser(userId);

      // Assert
      expect(mockUserService.unblockUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // Arrange
      const userId = '123' as Uuid;
      mockUserService.deleteUser.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(userId);

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
