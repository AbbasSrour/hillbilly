import { Button } from '@hillbilly/ui/core/button';
import { Calendar } from '@hillbilly/ui/core/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@hillbilly/ui/core/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hillbilly/ui/core/select';
import { cn } from '@hillbilly/ui/lib/utils';
import { addDays, format, getMonth, getYear, isSameDay, setMonth, setYear } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

export type DatePreset = {
  label: string;
  value: string;
  getDate: () => Date;
};

const DEFAULT_DATE_PRESETS: DatePreset[] = [
  {
    label: 'Today',
    value: 'today',
    getDate: () => new Date(),
  },
  {
    label: 'Tomorrow',
    value: 'tomorrow',
    getDate: () => addDays(new Date(), 1),
  },
  {
    label: 'In 3 days',
    value: 'in-3-days',
    getDate: () => addDays(new Date(), 3),
  },
  {
    label: 'In a week',
    value: 'in-a-week',
    getDate: () => addDays(new Date(), 7),
  },
  {
    label: 'In 2 weeks',
    value: 'in-2-weeks',
    getDate: () => addDays(new Date(), 14),
  },
];

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPresets?: boolean;
  presets?: DatePreset[];
  startYear?: number;
  endYear?: number;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled = false,
  showPresets = false,
  presets = DEFAULT_DATE_PRESETS,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);
  const [selectedPresetValue, setSelectedPresetValue] = React.useState<string | undefined>(
    undefined,
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = React.useMemo(() => {
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [startYear, endYear]);

  const handleMonthChange = (month: string) => {
    if (!date) return;
    const newDate = setMonth(date, months.indexOf(month));
    handleSelect(newDate);
  };

  const handleYearChange = (year: string) => {
    if (!date) return;
    const newDate = setYear(date, Number.parseInt(year));
    handleSelect(newDate);
  };

  const findMatchingPreset = React.useCallback(
    (dateToCheck: Date) => {
      return presets.find((preset) => {
        const presetDate = preset.getDate();
        return isSameDay(presetDate, dateToCheck);
      });
    },
    [presets],
  );

  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setDate(newDate);

      const matchingPreset = findMatchingPreset(newDate);
      setSelectedPresetValue(matchingPreset?.value);
    } else {
      setDate(undefined);
      setSelectedPresetValue(undefined);
    }
  }, [value, findMatchingPreset]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const matchingPreset = findMatchingPreset(selectedDate);
      setSelectedPresetValue(matchingPreset?.value || undefined);
      onChange(selectedDate.toISOString().split('T')[0]);
    } else {
      setSelectedPresetValue(undefined);
      onChange(undefined);
    }
  };

  const handlePresetChange = (value: string) => {
    const selectedPreset = presets.find((preset) => preset.value === value);
    if (selectedPreset) {
      const presetDate = selectedPreset.getDate();
      setDate(presetDate);
      setSelectedPresetValue(value);
      onChange(presetDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto', showPresets ? 'p-2 space-y-2' : 'p-0')} align="start">
        {showPresets && presets.length > 0 && (
          <Select value={selectedPresetValue} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className={cn('rounded-md', showPresets && 'border')}>
          <Calendar mode="single" selected={date} onSelect={handleSelect} autoFocus month={date} />
        </div>
        {date && (
          <div className="flex justify-between gap-2">
            <Select onValueChange={handleMonthChange} value={months[getMonth(date)]}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleYearChange} value={getYear(date).toString()}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export type DateRangePreset = {
  label: string;
  value: string;
  dateRange: () => DateRange;
};

const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    value: 'today',
    dateRange: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: 'Next 7 days',
    value: 'next-7-days',
    dateRange: () => {
      const today = new Date();
      return { from: today, to: addDays(today, 6) };
    },
  },
  {
    label: 'Next 30 days',
    value: 'next-30-days',
    dateRange: () => {
      const today = new Date();
      return { from: today, to: addDays(today, 29) };
    },
  },
];

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  numberOfMonths?: number;
  showPresets?: boolean;
  presets?: DateRangePreset[];
  startYear?: number;
  endYear?: number;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select date range',
  className,
  disabled = false,
  numberOfMonths = 2,
  showPresets = false,
  presets = DEFAULT_DATE_RANGE_PRESETS,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value);
  const [selectedPresetValue, setSelectedPresetValue] = React.useState<string | undefined>(
    undefined,
  );
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    dateRange?.from ? new Date(dateRange.from) : new Date(),
  );

  // Month and year arrays for selectors
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const years = React.useMemo(() => {
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, [startYear, endYear]);

  // Handlers for month and year selection
  const handleMonthChange = (month: string) => {
    const newDate = setMonth(currentMonth, months.indexOf(month));
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentMonth, Number.parseInt(year));
    setCurrentMonth(newDate);
  };

  const findMatchingPreset = React.useCallback(
    (range: DateRange) => {
      if (!range.from || !range.to) return undefined;

      return presets.find((preset) => {
        const presetRange = preset.dateRange();
        return (
          presetRange.from &&
          presetRange.to &&
          isSameDay(presetRange.from, range.from as Date) &&
          isSameDay(presetRange.to, range.to as Date)
        );
      });
    },
    [presets],
  );

  React.useEffect(() => {
    if (value) {
      setDateRange(value);

      // Update currentMonth to match the from date
      if (value.from) {
        setCurrentMonth(new Date(value.from));
      }

      const matchingPreset = findMatchingPreset(value);
      setSelectedPresetValue(matchingPreset?.value);
    } else {
      setDateRange(undefined);
      setSelectedPresetValue(undefined);
    }
  }, [value, findMatchingPreset]);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from && range?.to) {
      const matchingPreset = findMatchingPreset(range);
      setSelectedPresetValue(matchingPreset?.value || undefined);
    } else {
      setSelectedPresetValue(undefined);
    }

    onChange(range);
  };

  const handlePresetChange = (value: string) => {
    const selectedPreset = presets.find((preset) => preset.value === value);
    if (selectedPreset) {
      const range = selectedPreset.dateRange();
      setDateRange(range);
      setSelectedPresetValue(value);
      onChange(range);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateRange && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'PPP')} - {format(dateRange.to, 'PPP')}
              </>
            ) : (
              format(dateRange.from, 'PPP')
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto', showPresets ? 'p-2 space-y-2' : 'p-0')} align="start">
        {showPresets && presets.length > 0 && (
          <Select value={selectedPresetValue} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className={cn('rounded-md', showPresets && 'border')}>
          <Calendar
            mode="range"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            autoFocus
          />
        </div>
        <div className="flex justify-between gap-2">
          <Select onValueChange={handleMonthChange} value={months[getMonth(currentMonth)]}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleYearChange} value={getYear(currentMonth).toString()}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
