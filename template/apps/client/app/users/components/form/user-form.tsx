'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Combobox } from '@hillbilly/ui/components/form/combobox';
import { EmailInput } from '@hillbilly/ui/components/form/email-input';
import { PasswordInput } from '@hillbilly/ui/components/form/password-input';
import { PhoneInput } from '@hillbilly/ui/components/form/phone-input';
import {
  Form,
  FormContent,
  FormControl,
  FormDescription,
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
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { rolesQueries } from '@/app/roles/hooks/api/roles.queries.ts';
import { userFormDefaultValues } from '@/app/users/components/form/user-form-default-values.ts';
import {
  buildUserFormSchema,
  type UserFormSchema,
} from '@/app/users/components/form/user-form-schema.ts';
import { userRoleTypes } from '@/app/users/constants/user-role-types.ts';
import { useCreateUser, useUpdateUser } from '@/app/users/hooks/api/users.queries.ts';
import {
  formToCreateUserPayload,
  formToUpdateUserPayload,
} from '@/app/users/utils/user-form-transformer.ts';
import { formKeyFactory } from '@/constants/form-key-factory.ts';

export const UserForm = ({
  defaultValues,
  userId,
}: {
  defaultValues?: UserFormSchema;
  userId?: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCreate = location.pathname.endsWith('/create');

  const form = useForm<UserFormSchema>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: defaultValues || userFormDefaultValues,
    resolver: zodResolver(buildUserFormSchema({ requirePassword: isCreate })),
  });

  const { mutate: createUser } = useCreateUser();
  const { mutate: updateUser } = useUpdateUser();

  const onSubmit = (values: UserFormSchema) => {
    if (isCreate) {
      const payload = formToCreateUserPayload(values);

      createUser(payload, {
        onSuccess: () => {
          void navigate({
            to: '/admin/users',
          });
        },
      });

      return;
    }

    if (!userId) {
      return;
    }

    const payload = formToUpdateUserPayload(values, userId);

    updateUser(payload, {
      onSuccess: () => {
        void navigate({
          to: '/admin/users',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} id={formKeyFactory.users.form}>
        <FormContent>
          <FormSection layout={'vertical'}>
            <FormSectionHeader>
              <FormSectionTitle>Personal Information</FormSectionTitle>
              <FormSectionDescription>
                Enter the user's basic personal information including their name, email address, and
                contact details.
              </FormSectionDescription>
            </FormSectionHeader>

            <FormSectionContent cols={1} spacing="lg">
              <FormRow cols={4}>
                <FirstNameField />
                <LastNameField />
              </FormRow>

              <FormRow cols={4}>
                <EmailField />
              </FormRow>

              <FormRow cols={4}>
                <PhoneField />
              </FormRow>
            </FormSectionContent>
          </FormSection>

          <FormSection layout={'vertical'}>
            <FormSectionHeader>
              <FormSectionTitle>Account Information</FormSectionTitle>
              <FormSectionDescription>
                Set up user access credentials and permissions by selecting a role and creating a
                secure password.
              </FormSectionDescription>
            </FormSectionHeader>

            <FormSectionContent layout="flex" direction="column" spacing="lg">
              <FormRow cols={4}>
                <RoleField />
              </FormRow>

              {/*{isCreate ? (*/}
              <FormRow cols={4}>
                <PasswordField />
                <ConfirmPasswordField />
              </FormRow>
              {/*) : null}*/}
            </FormSectionContent>
          </FormSection>
        </FormContent>
        <FormFooter />
      </form>
    </Form>
  );
};

const FirstNameField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={'firstName'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input {...field} placeholder={'John for example...'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const LastNameField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={'lastName'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input {...field} placeholder={'Can be Wick...'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const EmailField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={'email'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <EmailInput {...field} placeholder={'john-wick@continental.com'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const PhoneField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={'phoneNumber'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <PhoneInput {...field} placeholder={'00 000 000'} defaultCountry={'LB'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const RoleField = () => {
  const { control } = useFormContext();
  const [query, setQuery] = useState('');
  const { data: roles, isLoading } = useQuery(rolesQueries.list());

  const roleOptions = useMemo(() => {
    const availableRoles = roles ?? userRoleTypes;
    const normalizedQuery = query.trim().toLowerCase();

    return availableRoles
      .filter((role) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          role.label.toLowerCase().includes(normalizedQuery) ||
          role.value.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((role) => {
        const Icon = role.icon;

        return {
          value: role.value,
          label: role.label,
          icon: Icon ? <Icon /> : undefined,
        };
      });
  }, [roles, query]);

  return (
    <FormField
      control={control}
      name={'role'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <FormControl>
            <Combobox
              value={field.value}
              onChange={field.onChange}
              options={roleOptions}
              searchValue={query}
              setSearchValue={setQuery}
              placeholder="Select role"
              searchPlaceholder="Search roles"
              isLoading={isLoading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const PasswordField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={'password'}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <PasswordInput {...field} placeholder={'******'} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const ConfirmPasswordField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      name={'passwordConfirmation'}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <PasswordInput {...field} placeholder={'******'} />
          </FormControl>
          <FormDescription>Must match the password field</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
