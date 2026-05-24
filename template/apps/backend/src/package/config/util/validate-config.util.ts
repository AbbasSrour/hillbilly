/* @hillbilly-sync */
import { envValidationSchema } from '../schema/env.schema';

export const validateSchema = (config: Record<string, unknown>) => {
  const result = envValidationSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');

    console.log(result.error);

    throw new Error(`Config validation error: ${errors}`);
  }

  return result.data;
};
