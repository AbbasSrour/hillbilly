import { Card, CardContent, CardHeader, CardTitle } from '@hillbilly/ui/core/card';
import { cn } from '@hillbilly/ui/lib/utils';
import type { ElementType } from 'react';

interface InsightCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon?: ElementType;
  gradientClassName?: string;
  iconClassName?: string;
  className?: string;
}

export const InsightCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  gradientClassName,
  iconClassName,
  className,
}: InsightCardProps) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border bg-card shadow-none transition-colors hover:bg-muted/50',
        className,
      )}
    >
      <div
        className={cn(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-50 blur-2xl',
          gradientClassName,
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? <Icon className={cn('h-4 w-4', iconClassName)} /> : null}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        {subtext ? <p className="text-xs text-muted-foreground mt-1">{subtext}</p> : null}
      </CardContent>
    </Card>
  );
};
