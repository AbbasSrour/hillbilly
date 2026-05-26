import { Badge } from '@hillbilly/ui/core/badge';
import { Button } from '@hillbilly/ui/core/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@hillbilly/ui/core/command';
import { Popover, PopoverContent, PopoverTrigger } from '@hillbilly/ui/core/popover';
import { Separator } from '@hillbilly/ui/core/separator';
import { cn } from '@hillbilly/ui/lib/utils';
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import type * as React from 'react';
import { useDataTableContext } from './data-table-provider';

interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps {
  columnId: string;
  title?: string;
  options: Array<Option> | ReadonlyArray<Option>;
}

// TODO this needs to handle infinite queries
export function DataTableFacetedFilter<TData>({
  columnId,
  title,
  options,
}: DataTableFacetedFilterProps) {
  const table = useDataTableContext<TData>();
  const column = table.getColumn(columnId);
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command
          filter={(value, search, keywords) => {
            const searchValue = keywords
              ? `${value} ${keywords?.map((val) => val.toLowerCase()).join(' ')}`
              : value;
            if (searchValue.includes(search)) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4 text-white')} />
                    </div>
                    {option.icon && <option.icon className="text-muted-foreground mr-2 h-4 w-4" />}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
