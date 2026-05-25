import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth.ts";

export type GetUserPermissionsInput = Parameters<
	typeof authClient.rbac.getUserPermissions
>[0];

export const getUserPermissionsFn = async (
	params: GetUserPermissionsInput,
	headers?: Headers,
) => {
	const res = await authClient.rbac.getUserPermissions({
		...params,
		headers: headers,
	});

	if (res.error) {
		throw res.error;
	}

	return res.data;
};

export const getUserPermissionsServerFn = createIsomorphicFn()
	.client((params?: GetUserPermissionsInput) => getUserPermissionsFn(params))
	.server((params?: GetUserPermissionsInput) =>
		getUserPermissionsFn(params, getRequestHeaders()),
	);
