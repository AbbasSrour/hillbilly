import type { UserFormSchema } from '@/app/users/components/form/user-form-schema.ts';

export const userFormDefaultValues: UserFormSchema = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: '',
  password: '',
  passwordConfirmation: '',
};
