import { ColumnFiltersState } from "@tanstack/react-table";

export const transformColumnFilters = (columnFilters: ColumnFiltersState) => {
  return columnFilters.reduce<Record<string, unknown>>((acc, filter) => {
    acc[filter.id] = Array.isArray(filter.value) ? filter.value : filter.value;
    return acc;
  }, {});
};
