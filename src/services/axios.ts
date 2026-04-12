import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL,
	withCredentials: true,
});

const refreshAccessToken = async () => {
	return api.post("/token/refresh/");
};

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const originalRequest = error.config;

		if (
			(error.response?.status === 401 ||
				error.response?.status === 403) &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;

			try {
				await refreshAccessToken();
				return api(originalRequest);
			} catch (err) {
				return Promise.reject(err);
			}
		}

		return Promise.reject(error);
	},
);

export default api;
