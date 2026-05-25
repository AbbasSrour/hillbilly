import { zodResolver } from '@hookform/resolvers/zod';
import { EmailInput } from '@hillbilly/ui/components/form/email-input';
import { PasswordInput } from '@hillbilly/ui/components/form/password-input';
import { Button } from '@hillbilly/ui/core/button';
import { Checkbox } from '@hillbilly/ui/core/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@hillbilly/ui/core/form';
import { Label } from '@hillbilly/ui/core/label';
import { useNavigate } from '@tanstack/react-router';
import { useId } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { m } from '@/paraglide/messages';

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginFormValues) => {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (result.error) {
      toast.error(result.error.message || m.auth_error_generic());
      return;
    }

    await navigate({
      to: '/',
      reloadDocument: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
        <div className="flex flex-col gap-6">
          <EmailField />
          <PasswordField />
          <RememberMeField />
          <Button
            type="submit"
            className="h-12 w-full bg-[#EC2028] text-lg font-medium hover:bg-[#D81B21]"
          >
            {m.auth_login_button()}
          </Button>
        </div>
      </form>
    </Form>
  );
}

const EmailField = () => {
  const { control } = useFormContext<LoginFormValues>();
  const id = useId();

  return (
    <FormField
      name="email"
      control={control}
      render={({ field }) => (
        <FormItem>
          <Label htmlFor={id} className="text-lg font-normal text-white">
            {m.auth_login_email_label()}
          </Label>
          <FormControl>
            <EmailInput
              {...field}
              id={id}
              type="email"
              placeholder={m.auth_login_email_placeholder()}
              className="border-0 bg-[#363636] text-white"
              required
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const PasswordField = () => {
  const { control } = useFormContext<LoginFormValues>();
  const id = useId();

  return (
    <FormField
      name="password"
      control={control}
      render={({ field }) => (
        <FormItem>
          <Label htmlFor={id} className="text-lg font-normal text-white">
            {m.auth_login_password_label()}
          </Label>
          <FormControl>
            <PasswordInput
              {...field}
              id={id}
              placeholder="******"
              className="border-0 bg-[#363636] text-white"
              required
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const RememberMeField = () => {
  const { control } = useFormContext<LoginFormValues>();

  return (
    <FormField
      control={control}
      name="rememberMe"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <Label className="text-white">{m.auth_login_remember_me()}</Label>
        </FormItem>
      )}
    />
  );
};
