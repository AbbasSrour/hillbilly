import { type FilterQuery, MikroORM, wrap } from '@mikro-orm/core';
import { EnsureRequestContext, Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { ExtendedEntityRepository } from '@/abstract/repository/abstract-entity.repository';
import type { IFile } from '@/interface/IFile';
import { ValidatorService } from '@/package/validation/service/validator.service';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import { UpdateCurrentUserDto } from '../dto/update-current-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';
import { UsersPageOptionsDto } from '../dto/users-page-options.dto';
import { UserSettingsEntity } from '../entity/user-settings.entity';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: ExtendedEntityRepository<UserEntity>,
    @InjectRepository(UserSettingsEntity)
    private userSettingsRepository: ExtendedEntityRepository<UserSettingsEntity>,
    private readonly validatorService: ValidatorService,
    private readonly _orm: MikroORM,
  ) {}

  public async findOne(findData: FilterQuery<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOne(findData, {
      populate: ['role', 'settings'],
    });
  }

  @Transactional()
  @EnsureRequestContext()
  public async createUser(createUserDto: CreateUserDto, file?: IFile): Promise<UserEntity> {
    const { ...userDto } = createUserDto;

    // @ts-ignore
    const user = this.userRepository.create({
      ...userDto,
    });

    if (file && !this.validatorService.isImage(file.mimetype)) {
      // throw new FileNotImageException();
    }

    this.userRepository.persist(user);

    user.settings = this.createSettings(
      user.id,
      plainToClass(CreateSettingsDto, {
        isEmailVerified: false,
        isPhoneVerified: false,
      }),
    );

    await this.userRepository.flush();

    return user;
  }

  public async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
    filters: UserFiltersDto,
    user: UserEntity,
  ) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'settings');

    // if (user.role.name !== RoleType.ADMIN) {
    //   queryBuilder.andWhere({
    //     role: {
    //       name: {
    //         $ne: RoleType.ADMIN,
    //       },
    //     },
    //   });
    // }

    if (pageOptionsDto.q) {
      queryBuilder.searchByString(pageOptionsDto.q, ['user.name', 'user.email']);
    }

    queryBuilder.filter(filters);

    return await queryBuilder.paginate(pageOptionsDto);
  }

  public async getUser(userId: Uuid) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.settings', 's');

    await queryBuilder.where('u.id = ?', [userId]);

    const userEntity = await queryBuilder.getSingleResult();

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity;
  }

  @Transactional()
  @EnsureRequestContext()
  public async updateUser(userId: Uuid, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ['settings'],
    });

    const { profile, ...userUpdates } = updateUserDto;

    wrap(user).assign(userUpdates);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      if (user.settings) {
        user.emailVerified = false;
      }
    }

    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
      if (user.settings) {
        user.phoneNumberVerified = false;
      }
    }

    await this.userRepository.flush();

    return user;
  }

  @Transactional()
  @EnsureRequestContext()
  public async updateCurrentUser(
    userId: Uuid,
    updateCurrentUserDto: UpdateCurrentUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ['settings'],
    });

    if (updateCurrentUserDto.email && updateCurrentUserDto.email !== user.email) {
      user.email = updateCurrentUserDto.email;
      if (user.settings) {
        user.emailVerified = false;
      }
    }

    if (updateCurrentUserDto.phoneNumber && updateCurrentUserDto.phoneNumber !== user.phoneNumber) {
      user.phoneNumber = updateCurrentUserDto.phoneNumber;
      if (user.settings) {
        user.phoneNumberVerified = false;
      }
    }

    await this.userRepository.flush();

    return user;
  }

  public async blockUser(userId: Uuid): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ['role', 'settings'],
    });

    // if (user.role.name === RoleType.ADMIN) {
    //   throw new AdminProtectedException('Admin cannot be blocked');
    // }

    user.banned = true;
    await this.userRepository.flush();

    return user;
  }

  public async unblockUser(userId: Uuid): Promise<UserEntity> {
    const user = await this.userRepository.findOneOrFail(userId, {
      populate: ['role', 'settings'],
    });

    user.banned = false;
    await this.userRepository.flush();

    return user;
  }

  public async deleteUser(userId: Uuid): Promise<void> {
    const user = await this.userRepository.findOneOrFail(userId);
    // if (user.role.name === RoleType.ADMIN) {
    //   throw new AdminProtectedException('Admin cannot be deleted');
    // }

    this.userRepository.remove(user);
    await this.userRepository.flush();
  }

  public createSettings(userId: Uuid, createSettingsDto: CreateSettingsDto): UserSettingsEntity {
    const userSettingsEntity = this.userSettingsRepository.create({
      ...createSettingsDto,
      user: userId,
    });

    this.userSettingsRepository.persist(userSettingsEntity);

    return userSettingsEntity;
  }

  public async updateSettings(userId: Uuid, updateSettingsDto: CreateSettingsDto) {
    const userSettingsEntity = await this.userSettingsRepository.findOne({
      user: userId,
    });

    if (!userSettingsEntity) {
      throw new UserNotFoundException();
    }

    this.userSettingsRepository.assign(userSettingsEntity, updateSettingsDto);

    return userSettingsEntity;
  }
}
