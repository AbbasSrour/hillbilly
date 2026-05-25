'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { EmailInput } from '@hillbilly/ui/components/form/email-input';
import { PhoneInput } from '@hillbilly/ui/components/form/phone-input';
import {
  Form,
  FormContent,
  FormControl,
  FormField,
  FormFooter,
  FormItem,
  FormLabel,
  FormMessage,
  FormRow,
  FormSection,
  FormSectionContent,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
} from '@hillbilly/ui/core/form';
import { Input } from '@hillbilly/ui/core/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUpdateMe } from '@/app/profile/hooks/api/profile.queries.ts';
import { formKeyFactory } from '@/constants/form-key-factory.ts';
import type { UserDto } from '@hillbilly/sdk';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});

type ProfileFormSchema = z.infer<typeof profileFormSchema>;

export const ProfileForm = ({ user }: { user: UserDto }) => {
  const { mutate: updateMe } = useUpdateMe();

  const form = useForm<ProfileFormSchema>({
    mode: 'onSubmit',
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    },
    resolver: zodResolver(profileFormSchema),
  });

  const onSubmit = (values: ProfileFormSchema) => {
    updateMe({
      email: values.email,
      phone: values.phone,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={formKeyFactory.users.form}>
        <FormContent>
          <FormSection layout="vertical">
            <FormSectionHeader>
              <FormSectionTitle>Profile</FormSectionTitle>
              <FormSectionDescription>
                Update your personal information.
              </FormSectionDescription>
            </FormSectionHeader>
            <FormSectionContent cols={1} spacing="lg">
              <FormRow cols={4}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormRow>
              <FormRow cols={4}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <EmailInput {...field} placeholder="you@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormRow>
              <FormRow cols={4}>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          placeholder="00 000 000"
                          defaultCountry="LB"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormRow>
            </FormSectionContent>
          </FormSection>
        </FormContent>
        <FormFooter />
      </form>
    </Form>
  );
};
