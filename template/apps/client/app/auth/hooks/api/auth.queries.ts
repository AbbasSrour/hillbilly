import { queryOptions } from "@tanstack/react-query";
import { getUserPermissionsServerFn } from "@/app/auth/hooks/api/auth.functions.ts";

export const authQueries = {
	entity: queryOptions({
		queryKey: ["auth"],
	}),
	userPermissions: () =>
		queryOptions({
			queryKey: [...authQueries.entity.queryKey, "userPermissions"],
			queryFn: async () => {
				return await getUserPermissionsServerFn();
			},
		}),
};
