import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
	onUnauthorizedCallback = callback;
};

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASEURL || "http://localhost:3000",
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = cookies.get("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			cookies.remove("token", { path: "/" });
			if (onUnauthorizedCallback) {
				onUnauthorizedCallback();
			}
		}
		return Promise.reject(error);
	},
);
