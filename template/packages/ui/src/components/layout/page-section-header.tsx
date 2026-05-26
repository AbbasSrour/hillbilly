import { Separator } from '@hillbilly/ui/core/separator';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  withSeparator?: boolean;
}

export const PageSectionHeader = ({
  title,
  description,
  actions,
  withSeparator = false,
}: SectionHeaderProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h3>
          {description && <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {withSeparator && <Separator className="mt-2" />}
    </div>
  );
};
