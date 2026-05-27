import 'source-map-support/register.js';
import 'reflect-metadata';

import { Collection } from '@mikro-orm/core';
import { QueryBuilder } from '@mikro-orm/sql';

import { AbstractDto } from '@/abstract/dto/abstract.dto';
import { CreateTranslationDto } from '@/abstract/dto/create-translation.dto';
import { PageMetaDto } from '@/abstract/dto/page-meta.dto';
import { PageOptionsDto } from '@/abstract/dto/page-options.dto';
import { PageDto } from '@/abstract/dto/page.dto';
import { AbstractEntity } from '@/abstract/entity/abstract.entity';
import type { LanguageCode } from '@/constant/language-code.constant';
import {
  FILTER_OPERATION_KEY,
  FilterMetadata,
  FilterOperationType,
} from '@/decorator/field/filter-field.decorator';
import _ from 'lodash';
const { compact, isArray, isNil, map } = _;

// ------------------------------------------------ Global -----------------------------------------------------------//
declare global {
  export type Uuid = string & { _uuidBrand: undefined };
  export type Todo = unknown & { _todoBrand: undefined };

  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];

    getByLanguage(this: CreateTranslationDto[], languageCode: LanguageCode): string;

    // FIXME this returns PageDto<AbstractDto> not PageDto<EntityDto>
    //       it should infer the dto from the items
    toPageDto<Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: unknown,
    ): PageDto<Dto>;
  }
}

Array.prototype.toDtos = function <Entity extends AbstractEntity<Dto>, Dto extends AbstractDto>(
  options?: unknown,
): Dto[] {
  return compact(map<Entity, Dto>(this as Entity[], (item) => item.toDto(options as never)));
};

Array.prototype.getByLanguage = function (languageCode: LanguageCode): string {
  return this.find((translation) => languageCode === translation.languageCode)?.text || '';
};

Array.prototype.toPageDto = function (pageMetaDto: PageMetaDto, options?: unknown) {
  return new PageDto(this.toDtos(options), pageMetaDto);
};

// ------------------------------------------------ ORM --------------------------------------------------------------//
declare module '@mikro-orm/core' {
  interface Collection<T> {
    toDtos<Dto extends AbstractDto>(this: Collection<T>, options?: unknown): Dto[];
  }
}

declare module '@mikro-orm/sql' {
  interface QueryBuilder<Entity> {
    searchByString(
      this: QueryBuilder<Entity>,
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean;
      },
    ): this;

    filter(this: QueryBuilder<Entity>, filter: Record<string, unknown> | object): this;

    paginate(
      this: QueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean; skipCount: boolean }>,
    ): Promise<[Entity[], PageMetaDto]>;
  }
}

Collection.prototype.toDtos = function <T extends AbstractDto, O>(
  this: Collection<T>,
  options?: O,
) {
  if (!this.isInitialized()) {
    return [];
  }

  return this.getItems().toDtos(options);
};

QueryBuilder.prototype.searchByString = function (q, columnNames, options) {
  if (!q) {
    return this;
  }

  const searchConditions = columnNames.map((columnName) => {
    const searchValue = options?.formStart ? `${q}%` : `%${q}%`;
    return { [columnName]: { $ilike: searchValue } };
  });

  this.andWhere({ $or: searchConditions });

  return this;
};

QueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
) {
  const qb = this.clone();

  if (!options?.takeAll) {
    qb.limit(pageOptionsDto.take, pageOptionsDto.skip);
  }

  const hasExistingOrderBy =
    qb.state.orderBy &&
    isArray(qb.state.orderBy) &&
    qb.state.orderBy.some(
      (prop) =>
        prop &&
        typeof prop === 'object' &&
        Object.values(prop)?.some((value) => value === 'ASC' || value === 'DESC'),
    );

  if (pageOptionsDto.sort && !hasExistingOrderBy) {
    qb.orderBy({ [pageOptionsDto.sort]: pageOptionsDto.order });
  }

  const [entities, itemCount] = await qb.getResultAndCount();

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return [entities, pageMetaDto];
};

// TODO verify that the field exists and a way to infer the location
//      from the dto
QueryBuilder.prototype.filter = function (filters: Record<string, unknown> | object) {
  if (!filters || Object.keys(filters).length === 0) {
    return this;
  }

  const conditions: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (isNil(value) || value === '') {
      continue;
    }

    const filterMetadata = Reflect.getMetadata(
      FILTER_OPERATION_KEY,
      filters,
      key,
    ) as FilterMetadata;

    const filterOperation = filterMetadata?.operation;
    const filterKey = filterMetadata?.field ?? key;

    if (filterOperation) {
      switch (filterOperation) {
        case FilterOperationType.EQUALS:
          conditions[filterKey] = value;
          break;
        case FilterOperationType.NOT_EQUALS:
          conditions[filterKey] = { $ne: value };
          break;
        case FilterOperationType.CONTAINS:
          if (typeof value === 'string') {
            conditions[filterKey] = { $ilike: `%${value}%` };
          } else {
            conditions[filterKey] = value;
          }
          break;
        case FilterOperationType.STARTS_WITH:
          if (typeof value === 'string') {
            conditions[filterKey] = { $ilike: `${value}%` };
          } else {
            conditions[filterKey] = value;
          }
          break;
        case FilterOperationType.ENDS_WITH:
          if (typeof value === 'string') {
            conditions[filterKey] = { $ilike: `%${value}` };
          } else {
            conditions[filterKey] = value;
          }
          break;
        case FilterOperationType.GREATER_THAN:
          conditions[filterKey] = { $gt: value };
          break;
        case FilterOperationType.LESS_THAN:
          conditions[filterKey] = { $lt: value };
          break;
        case FilterOperationType.GREATER_THAN_OR_EQUAL:
          conditions[filterKey] = { $gte: value };
          break;
        case FilterOperationType.LESS_THAN_OR_EQUAL:
          conditions[filterKey] = { $lte: value };
          break;
        case FilterOperationType.IN:
          conditions[filterKey] = {
            $in: Array.isArray(value) ? value : [value],
          };
          break;
        case FilterOperationType.NOT_IN:
          conditions[filterKey] = {
            $nin: Array.isArray(value) ? value : [value],
          };
          break;
        case FilterOperationType.IS_NULL:
          conditions[filterKey] = { $eq: null };
          break;
        case FilterOperationType.IS_NOT_NULL:
          conditions[filterKey] = { $ne: null };
          break;
        default:
          conditions[filterKey] = value;
      }
    } else {
      if (typeof value === 'string') {
        conditions[filterKey] = { $ilike: `%${value}%` };
      } else {
        conditions[filterKey] = value;
      }
    }
  }

  this.andWhere(conditions);

  return this;
};
