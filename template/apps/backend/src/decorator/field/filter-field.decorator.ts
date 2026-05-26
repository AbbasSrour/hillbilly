export enum FilterOperationType {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

export interface FilterMetadata {
  operation: FilterOperationType;
  field?: string;
}

export interface IFilterFieldOptions {
  operation?: FilterOperationType;
  defaultOperation?: FilterOperationType;
  field?: string;
}

export const FILTER_OPERATION_KEY = 'filter:operation';

/**
 * Decorator that combines a field decorator with filter operation metadata
 * @param options Filter field options
 * @returns PropertyDecorator
 **/
export function FilterField(options: IFilterFieldOptions = {}): PropertyDecorator {
  const operation = options.operation || options.defaultOperation || FilterOperationType.EQUALS;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return (target: any, propertyKey: string | symbol | undefined) => {
    if (propertyKey) {
      Reflect.defineMetadata(
        FILTER_OPERATION_KEY,
        {
          operation,
          field: options?.field,
        },
        target,
        propertyKey,
      );
    }
  };
}
