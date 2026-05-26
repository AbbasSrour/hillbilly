import { Button } from '@hillbilly/ui/core/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hillbilly/ui/core/tooltip';
import { cn } from '@hillbilly/ui/lib/utils';
import { CheckIcon, CopyIcon, PhoneIcon } from 'lucide-react';
import { type ReactNode, useCallback, useState } from 'react';
import * as RPNInput from 'react-phone-number-input';

interface DataTablePhoneCellProps {
  value: string | undefined | null;
  className?: string;
  showIcon?: boolean;
  copyable?: boolean;
  format?: 'international' | 'national' | 'e164';
  fallback?: ReactNode;
}

function formatPhoneNumber(
  phone: string,
  format: DataTablePhoneCellProps['format'] = 'international',
): string {
  try {
    if (format === 'e164') {
      return phone;
    }

    if (format === 'national') {
      return RPNInput.formatPhoneNumber(phone) ?? phone;
    }

    return RPNInput.formatPhoneNumberIntl(phone) ?? phone;
  } catch {
    return phone;
  }
}

export function DataTablePhoneCell({
  value,
  className,
  showIcon = true,
  copyable = true,
  format = 'international',
  fallback = '-',
}: DataTablePhoneCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [value]);

  if (!value) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const rawPhone = value.startsWith('tel:') ? value.slice(4) : value;
  const formattedPhone = formatPhoneNumber(rawPhone, format);
  const phoneHref = value.startsWith('tel:') ? value : `tel:${rawPhone}`;

  return (
    <div className={cn('group flex min-w-0 items-center gap-2', className)}>
      <div className="group/phone flex min-w-0 items-center gap-2">
        {showIcon && (
          <PhoneIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover/phone:text-primary group-focus-within/phone:text-primary" />
        )}
        <a
          href={phoneHref}
          className="truncate text-sm font-medium tabular-nums tracking-[0.01em] text-foreground transition-colors hover:text-primary"
          title={formattedPhone}
        >
          {formattedPhone}
        </a>
      </div>
      {copyable && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                onClick={handleCopy}
                type="button"
              >
                {copied ? (
                  <CheckIcon className="h-3 w-3 text-primary" />
                ) : (
                  <CopyIcon className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {copied ? 'Copied!' : 'Copy phone number'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
