import { Popover, PopoverContent, PopoverTrigger } from '@hillbilly/ui/core/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@hillbilly/ui/core/tooltip';
import { cn } from '@hillbilly/ui/lib/utils';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function DataTableTextCell({
  children,
  className = '',
  contentClassName = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOverflown, setIsOverflown] = useState(false);

  useEffect(() => {
    if (checkOverflow(ref.current)) {
      setIsOverflown(true);
      return;
    }

    setIsOverflown(false);
  }, []);

  if (!isOverflown)
    return (
      <div ref={ref} className={cn('truncate', className)}>
        {children}
      </div>
    );

  return (
    <>
      <div className="hidden sm:block">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div ref={ref} className={cn('truncate', className)}>
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className={contentClassName}>{children}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <div ref={ref} className={cn('truncate', className)}>
              {children}
            </div>
          </PopoverTrigger>
          <PopoverContent className={cn('w-fit', contentClassName)}>
            <p>{children}</p>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

const checkOverflow = (textContainer: HTMLDivElement | null) => {
  if (textContainer) {
    return (
      textContainer.offsetHeight < textContainer.scrollHeight ||
      textContainer.offsetWidth < textContainer.scrollWidth
    );
  }
  return false;
};
