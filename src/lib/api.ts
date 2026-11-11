import axios from "axios";

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
	onUnauthorizedCallback = callback;
};

export const API_BASE_URL =
	import.meta.env.VITE_API_BASEURL || "http://localhost:3000";

export const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && onUnauthorizedCallback) {
			onUnauthorizedCallback();
		}
		return Promise.reject(error);
	},
);
