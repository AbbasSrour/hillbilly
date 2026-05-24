import { InjectRepository } from '@mikro-orm/nestjs';
import type { EntityRepository } from '@mikro-orm/postgresql';
import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';

import type { CreateSettingsDto } from '../dto/create-settings.dto';
import { UserSettingsEntity } from '../entity/user-settings.entity';
import { MikroORM } from '@mikro-orm/core';
import { UserEntity } from '../entity/user.entity';

export class CreateSettingsCommand implements ICommand {
  constructor(
    public readonly userId: Uuid,
    public readonly createSettingsDto: CreateSettingsDto,
  ) {}
}

@CommandHandler(CreateSettingsCommand)
export class CreateSettingsHandler
  implements ICommandHandler<CreateSettingsCommand, UserSettingsEntity>
{
  constructor(
    @InjectRepository(UserSettingsEntity)
    private readonly userSettingsRepository: EntityRepository<UserSettingsEntity>,
  ) {}

  async execute(command: CreateSettingsCommand) {
    const { userId, createSettingsDto } = command;
    const userSettingsEntity =
      this.userSettingsRepository.create({
        ...createSettingsDto,
        user: userId
      });

    await this.userSettingsRepository.insert(userSettingsEntity);

    return userSettingsEntity;
  }
}
