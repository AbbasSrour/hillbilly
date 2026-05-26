import { useProjectContext } from '@hillbilly/ui/context/project';
import { m } from '@/paraglide/messages';

export const LoginHeader = () => {
  const { logoLarge } = useProjectContext();

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <div className="flex flex-col items-center gap-2 font-medium">
        <img src={logoLarge} alt="logo" className="mx-auto block h-auto w-32 object-cover" />
        <span className="sr-only text-white">{m.auth_login_brand_label()}</span>
      </div>
      <h1 className="text-4xl font-semibold text-white">{m.auth_login_welcome_title()}</h1>
    </div>
  );
};
