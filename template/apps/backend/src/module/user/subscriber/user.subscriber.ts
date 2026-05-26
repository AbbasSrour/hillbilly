import type { EventArgs, FlushEventArgs } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import type { EventSubscriber } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GeneratorProvider } from '@/provider/generator.provider';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserSubscriber implements EventSubscriber<UserEntity> {
  // TODO: fix this
  constructor(em: EntityManager) {
    em.getEventManager().registerSubscriber(this);
  }

  getSubscribedEntities() {
    return [UserEntity];
  }

  // TODO this is not gonna be needed since we already have this handled by betterauth
  onFlush(args: FlushEventArgs): void {
    for (const changeSet of args.uow.getChangeSets()) {
      const changedPassword = changeSet.payload.password;

      if (changedPassword) {
        changeSet.entity.password =
          GeneratorProvider.generateHash(changedPassword);
        args.uow.recomputeSingleChangeSet(changeSet.entity);
      }
    }
  }

  beforeUpdate(event: EventArgs<UserEntity>): void {
    const entity = event.entity;

    // if (
    //   entity.password &&
    //   entity.password !== event.changeSet?.entity.password
    // ) {
    //   entity.password = GeneratorProvider.generateHash(entity.password);
    // }
  }
}
