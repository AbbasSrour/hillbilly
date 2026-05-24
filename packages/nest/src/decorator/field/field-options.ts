import { IFilterFieldOptions } from "@/decorator/field/filter-field.decorator";

export interface IFieldOptions {
  each?: boolean;
  swagger?: boolean;
  nullable?: boolean;
  groups?: string[];
  filterOptions?: IFilterFieldOptions;
}
