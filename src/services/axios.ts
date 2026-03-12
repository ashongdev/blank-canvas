import axios from "axios";

const api = axios.create({
	baseURL: "http://127.0.0.1:8000/api", // Your Django URL
});

// REQUEST INTERCEPTOR: Add the Access Token to every outgoing request
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR: Catch 401s and Refresh the token
api.interceptors.response.use(
	(response) => response, // If request is successful, just return it
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 (Unauthorized) and we haven't tried refreshing yet
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const refreshToken = localStorage.getItem("refresh_token");

				// Ask Django for a new Access Token
				const res = await axios.post(
					"http://127.0.0.1:8000/api/auth/token/refresh",
					{
						refresh: refreshToken,
					},
				);

				if (res.status === 200) {
					const newAccessToken = res.data.access;
					localStorage.setItem("access_token", newAccessToken);

					// Update the header and retry the original request
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				// If Refresh Token is also expired/invalid, log them out
				console.error("Refresh token expired. Logging out.");
				localStorage.clear();
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	},
);

export default api;
