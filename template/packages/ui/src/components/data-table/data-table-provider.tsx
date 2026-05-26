import type { RowData, Table } from '@tanstack/react-table';
import { type ReactNode, createContext, useContext } from 'react';

export type DataTableContext<T extends RowData> = Table<T>;

const DataTableContext = createContext<DataTableContext<RowData> | null>(null);

export interface TableProviderProps<D extends RowData> extends Table<D> {
  children: ReactNode;
}

export const DataTableProvider = <D extends RowData>({
  children,
  ...tableProps
}: TableProviderProps<D>) => {
  return (
    <DataTableContext.Provider value={tableProps as DataTableContext<RowData>}>
      {children}
    </DataTableContext.Provider>
  );
};

export const useDataTableContext = <T extends RowData>() => {
  const context = useContext(DataTableContext) as DataTableContext<T>;
  if (!context) {
    throw new Error('useDatableContext must be used within a DataTableProvider');
  }

  return context;
};
