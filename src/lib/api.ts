import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASEURL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

api.interceptors.request.use(
	(config) => {
		const token = cookies.get("token");
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response.status === 401) cookies.remove("token", { path: "/" });
		return Promise.reject(error);
	},
);
