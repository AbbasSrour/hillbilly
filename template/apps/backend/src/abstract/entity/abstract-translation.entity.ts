import { Enum } from '@mikro-orm/decorators/legacy';

import { LanguageCode } from '@/constant/language-code.constant';
import type { AbstractTranslationDto } from '../dto/abstract-translation.dto';
import { AbstractEntity } from './abstract.entity';

export abstract class AbstractTranslationEntity<
  DTO extends AbstractTranslationDto = AbstractTranslationDto,
  O = never,
  Optional = never,
> extends AbstractEntity<DTO, O, Optional> {
  @Enum(() => LanguageCode)
  languageCode!: LanguageCode;
}
