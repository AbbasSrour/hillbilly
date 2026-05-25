import { env } from "@/config/env.ts";
import axios from "axios";

export const apiClient = axios.create({
	baseURL: env.VITE_API_URL,
	withCredentials: true,
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			if (typeof window !== "undefined") {
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(error);
	},
);
