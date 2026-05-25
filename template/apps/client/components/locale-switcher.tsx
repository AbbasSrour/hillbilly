/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: this came as is from tanstack start */
// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale

import { Button } from '@hillbilly/ui/core/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@hillbilly/ui/core/dropdown-menu';
import { cn } from '@hillbilly/ui/lib/utils';
import { IconCheck, IconLanguage } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { getLocale, locales, setLocale } from '@/paraglide/runtime';

export function LocaleSwitcher() {
  const currentLocale = getLocale();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="scale-95 rounded-full">
          <IconLanguage className="size-[1.2rem]" />
          <span className="sr-only">{m.language_label()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => {
          const label = new Intl.DisplayNames([locale], {
            type: 'language',
          }).of(locale);
          return (
            <DropdownMenuItem key={locale} onClick={() => setLocale(locale)}>
              <span className="capitalize">{label ?? locale}</span>
              <IconCheck
                size={14}
                className={cn('ml-auto', locale !== currentLocale && 'hidden')}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
