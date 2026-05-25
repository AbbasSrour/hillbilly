import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { authClient } from '@/lib/auth.ts';

// ---------------------------------------> List Users <----------------------------------------------------------//
export type ListUsersInput = Parameters<typeof authClient.admin.listUsers>[0];

export const listUsersFn = async (
  params: ListUsersInput,
  headers?: Headers,
) => {
  const res = await authClient.admin.listUsers({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const listUsersServerFn = createIsomorphicFn()
  .client((params: ListUsersInput) => listUsersFn(params))
  .server((params: ListUsersInput) => listUsersFn(params, getRequestHeaders()));

// ---------------------------------------> Get User <----------------------------------------------------------//
export type GetUserInput = Parameters<typeof authClient.admin.getUser>[0];

export const getUserFn = async (params: GetUserInput, headers?: Headers) => {
  const res = await authClient.admin.getUser({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const getUserServerFn = createIsomorphicFn()
  .client((params: GetUserInput) => getUserFn(params))
  .server((params: GetUserInput) => getUserFn(params, getRequestHeaders()));

// ---------------------------------------> Create User <----------------------------------------------------------//
export type CreateUserInput = Parameters<typeof authClient.admin.createUser>[0];

export const createUserFn = async (
  params: CreateUserInput,
  headers?: Headers,
) => {
  const res = await authClient.admin.createUser({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });
  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const createUserServerFn = createIsomorphicFn()
  .client((params: CreateUserInput) => createUserFn(params))
  .server((params: CreateUserInput) =>
    createUserFn(params, getRequestHeaders()),
  );

// ---------------------------------------> Update User <----------------------------------------------------------//
export type UpdateUserInput = Parameters<typeof authClient.admin.updateUser>[0];

export const updateUserFn = async (
  params: UpdateUserInput,
  headers?: Headers,
) => {
  const res = await authClient.admin.updateUser({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const updateUserServerFn = createIsomorphicFn()
  .client(async (params) => updateUserFn(params))
  .server(async (params: UpdateUserInput) =>
    updateUserFn(params, getRequestHeaders()),
  );

// ---------------------------------------> Delete User <----------------------------------------------------------//
export type DeleteUserInput = Parameters<typeof authClient.admin.removeUser>[0];

export const deleteUserFn = async (
  params: DeleteUserInput,
  headers?: Headers,
) => {
  const res = await authClient.admin.removeUser({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const deleteUserServerFn = createIsomorphicFn()
  .client((params: DeleteUserInput) => deleteUserFn(params))
  .server((params: DeleteUserInput) =>
    deleteUserFn(params, getRequestHeaders()),
  );

// ---------------------------------------> Send Verification Email <----------------------------------------------------------//
export type SendVerificationEmailInput = Parameters<
  typeof authClient.sendVerificationEmail
>[0];

export const sendVerificationEmailFn = async (
  params: SendVerificationEmailInput,
  headers?: Headers,
) => {
  const res = await authClient.sendVerificationEmail({
    ...params,
    fetchOptions: {
      ...params.fetchOptions,
      headers,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
};

export const sendVerificationEmailServerFn = createIsomorphicFn()
  .client((params: SendVerificationEmailInput) =>
    sendVerificationEmailFn(params),
  )
  .server((params: SendVerificationEmailInput) =>
    sendVerificationEmailFn(params, getRequestHeaders()),
  );
