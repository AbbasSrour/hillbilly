import { env } from "@/config/env.ts";
import { Configuration } from "@hillbilly/sdk";

export const sdkConfig = new Configuration({
	basePath: env.VITE_API_URL,
});
