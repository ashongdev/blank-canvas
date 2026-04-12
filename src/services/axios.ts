import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

const refreshAccessToken = async () => {
	try {
		await axios.post(
			`${BASE_URL}/v1/auth/token/refresh/`,
			{},
			{ withCredentials: true },
		);

		return;
	} catch (error) {
		return error;
	}
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If we get a 401, try to refresh the cookie
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				await refreshAccessToken();
				// Retry the original request (it will now have the new cookie)
				return api(originalRequest);
			} catch (refreshError) {
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	},
);

export default api;
