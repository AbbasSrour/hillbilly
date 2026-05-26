import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: unknown;
    mutationMeta: {
      showToast?: boolean;
      loadingMessage?: string;
      successMessage?: string;
      errorMessages?: {
        default: string;
        [key: string]: string;
      };
    };
  }
}
