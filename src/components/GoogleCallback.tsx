import api from "@/services/axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const GoogleCallback = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [error, setError] = useState("");

	useEffect(() => {
		// 1. Extract the 'code' from the URL
		const params = new URLSearchParams(location.search);
		const code = params.get("code");

		if (code) {
			handleGoogleLogin(code);
		}
	}, [location]);

	const handleGoogleLogin = async (code) => {
		try {
			// 2. Send the code to your Django Backend
			// Note: This endpoint must match the one you created in Django (urls.py)
			const decodedCode = decodeURIComponent(code);

			const res = await api.post("/auth/google/", {
				code: decodedCode,
			});

			// 3. Store the JWT tokens (access & refresh)
			// 'key' is the default response for dj-rest-auth, but with JWT it returns 'access' and 'refresh'
			const { access, refresh, user } = res.data;
			console.log(res.data);

			localStorage.setItem("access_token", access);
			localStorage.setItem("refresh_token", refresh);
			if (res.data.user) {
				localStorage.setItem("user", JSON.stringify(res.data.user));
			}
			// 4. Redirect user to dashboard/home
			navigate("/");
		} catch (err) {
			console.error("Login Failed:", err.response?.data);
			setError("Google login failed. Please try again.");
		}
	};

	return (
		<div>
			{error ? (
				<>
					<p style={{ color: "red" }}>{error}</p>
					<Link to="/">Home</Link>
				</>
			) : (
				<p>Processing login...</p>
			)}
		</div>
	);
};

export default GoogleCallback;
