import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[!#$%&*@^]/, {
    message: 'Password must contain at least one special character (!#$%&*@^)',
  })
  .regex(/^[\d!#$%&*@A-Z^a-z]*$/, {
    message:
      'Password can only contain letters, numbers, and these special characters: !#$%&*@^',
  });

const baseUserFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.email(),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, { message: 'Role is required' }),
  password: passwordSchema.optional(),
  passwordConfirmation: z.string().optional(),
});

export const buildUserFormSchema = ({
  requirePassword,
}: {
  requirePassword: boolean;
}) =>
  baseUserFormSchema.superRefine((data, ctx) => {
    if (requirePassword && !data.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password is required',
      });
    }

    if (data.password && !data.passwordConfirmation) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: 'Please confirm the password',
      });
    }

    if (data.password && data.passwordConfirmation) {
      if (data.password !== data.passwordConfirmation) {
        ctx.addIssue({
          code: 'custom',
          path: ['passwordConfirmation'],
          message: "Passwords don't match",
        });
      }
    }
  });

export type UserFormSchema = z.infer<typeof baseUserFormSchema>;
