import { cn } from '@hillbilly/ui/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';
import { FC } from 'react';

const currencyCellVariants = cva(
  'inline-flex items-center justify-center font-medium tabular-nums transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'text-sm px-2 py-1 rounded-md',
        compact: 'text-xs px-2 py-1 rounded-md bg-muted/30',
        enhanced:
          'text-sm px-3 py-2 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-border/50 shadow-sm',
      },
      colorCode: {
        true: '',
        false: 'text-foreground bg-background',
      },
      valueType: {
        positive:
          'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50',
        negative:
          'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50',
        zero: 'text-muted-foreground bg-muted/20 border-muted-foreground/20',
        neutral: '',
      },
      size: {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-1',
        lg: 'text-base px-3 py-2',
      },
      weight: {
        normal: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    compoundVariants: [
      {
        variant: 'enhanced',
        size: 'lg',
        className: 'tracking-wide',
      },
      {
        colorCode: false,
        valueType: ['positive', 'negative', 'zero'],
        className: 'text-foreground bg-background border-border',
      },
    ],
    defaultVariants: {
      variant: 'default',
      colorCode: true,
      valueType: 'neutral',
      size: 'md',
      weight: 'normal',
    },
  },
);

type CurrencyCellVariantProps = VariantProps<typeof currencyCellVariants>;

interface DataTableCurrencyCellProps extends CurrencyCellVariantProps {
  value?: number | null;
  currency?: string;
  locale?: string;
  className?: string;
  showCurrencySymbol?: boolean;
}

export const DataTableNumberCell: FC<DataTableCurrencyCellProps> = ({
  value = 0,
  currency = 'USD',
  locale = 'en-US',
  className,
  variant = 'default',
  colorCode = true,
  size = 'md',
  weight,
  showCurrencySymbol = true,
}) => {
  const numericValue = value || 0;

  const formattedValue = new Intl.NumberFormat(locale, {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);

  // Determine value type for styling
  const getValueType = (): 'positive' | 'negative' | 'zero' | 'neutral' => {
    if (!colorCode) return 'neutral';
    if (numericValue > 0) return 'positive';
    if (numericValue < 0) return 'negative';
    return 'zero';
  };

  // Determine weight based on value significance
  const getWeight = (): 'normal' | 'semibold' | 'bold' => {
    if (weight) return weight;
    if (numericValue !== 0) return 'semibold';
    return 'normal';
  };

  const valueType = getValueType();
  const fontWeight = getWeight();

  return (
    <div
      className={cn(
        currencyCellVariants({
          variant,
          colorCode,
          valueType,
          size,
          weight: fontWeight,
        }),
        className,
      )}
      title={`${formattedValue} ${currency}`}
    >
      {variant === 'enhanced' && showCurrencySymbol && (
        <span className="mr-1 text-xs opacity-60">{currency}</span>
      )}
      <span className={cn(variant === 'enhanced' && 'tracking-wide')}>{formattedValue}</span>
    </div>
  );
};

export { currencyCellVariants };
