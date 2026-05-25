import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const errorHandlingCodeWhitelist = [400, 403, 404, 409, 500];

type ErrorObject = {
  message: string;
  error: string;
  code: string;
};

const resolveErrorMessage = (
  payload: Partial<ErrorObject> | Error | undefined,
  errorMessages?: Record<string, string>,
) => {
  const errorPayload = payload as any;
  const candidates = [
    errorPayload,
    errorPayload?.data,
    errorPayload?.body,
    errorPayload?.error,
    errorPayload?.response?.data,
    errorPayload?.response,
    errorPayload?.cause,
  ];
  let code: string | undefined;
  let message: string | undefined;
  let error: string | undefined;

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (typeof candidate === 'string') {
      message = message || candidate;
      error = error || candidate;
      continue;
    }

    code = code || candidate.code;
    message = message || candidate.message;
    error = error || candidate.error;
  }

  return (
    (code && errorMessages?.[code]) ||
    (message && errorMessages?.[message]) ||
    error ||
    message ||
    code
  );
};

const queryCache = new QueryCache({
  onError: (error) => {
    if (typeof window !== 'undefined') {
      const err = error as Error;
      toast.error(`Something went wrong: ${err.message}`);
    }
  },
});

const mutationCache = new MutationCache({
  onMutate: (_, mutation) => {
    if (
      mutation.meta &&
      mutation.options.mutationKey &&
      mutation.meta.showToast !== false
    ) {
      toast.loading(mutation.meta.loadingMessage || 'Loading...', {
        id: mutation.options.mutationKey?.join('-'),
      });
    }
  },
  onSuccess: (_, __, ___, mutation) => {
    if (
      mutation.meta &&
      mutation.options.mutationKey &&
      mutation.meta.showToast !== false
    ) {
      toast.success(mutation.meta.successMessage || 'Success...', {
        id: mutation.options.mutationKey?.join('-'),
      });
    }
  },
  onError: (err, _variables, _context, mutation) => {
    if (
      mutation.meta &&
      mutation.options.mutationKey &&
      mutation.meta.showToast !== false
    ) {
      const isAxios = isAxiosError(err);
      if (!isAxios) {
        const fallbackErrorMessage =
          mutation.meta?.errorMessages?.default ?? 'Something went wrong...';
        const resolvedErrorMessage = resolveErrorMessage(
          err as Error,
          mutation.meta?.errorMessages,
        );
        const customErrorMessage = resolvedErrorMessage ?? fallbackErrorMessage;
        toast.error(customErrorMessage, {
          id: mutation.options.mutationKey?.join('-'),
        });

        return;
      }

      const statusInWhitelist = errorHandlingCodeWhitelist.includes(
        err.response?.status as number,
      );

      if (!statusInWhitelist) {
        const fallbackErrorMessage =
          mutation.meta?.errorMessages?.default ?? 'Something went wrong...';
        const resolvedErrorMessage = resolveErrorMessage(
          err.response?.data as Partial<ErrorObject>,
          mutation.meta?.errorMessages,
        );
        const customErrorMessage = resolvedErrorMessage ?? fallbackErrorMessage;
        toast.error(customErrorMessage, {
          id: mutation.options.mutationKey?.join('-'),
        });

        return;
      }

      if (Array.isArray(err.response?.data)) {
        const errors = err.response?.data;
        const errorCodes = errors.map((error: ErrorObject) => error.code);
        const customErrorMessages = errorCodes
          .map((code) => mutation.meta?.errorMessages?.[code] || code)
          .join('\n');

        toast.error(customErrorMessages, {
          id: mutation.options.mutationKey?.join('-'),
        });
      } else {
        const fallbackErrorMessage =
          mutation.meta?.errorMessages?.default ?? 'Something went wrong...';
        const resolvedErrorMessage = resolveErrorMessage(
          err.response?.data as Partial<ErrorObject>,
          mutation.meta?.errorMessages,
        );
        const customErrorMessage = resolvedErrorMessage ?? fallbackErrorMessage;
        toast.error(customErrorMessage, {
          id: mutation.options.mutationKey?.join('-'),
        });
      }
    }
  },
});

export function createQueryClient() {
  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 6000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        meta: {
          showToast: true,
        },
      },
    },
  });
}
