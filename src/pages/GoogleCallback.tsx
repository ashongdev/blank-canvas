import api from "@/services/axios";
import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const GoogleCallback = () => {
	const BASE_URL = import.meta.env.VITE_BASE_URL;

	const clearAuthCookies = () => {
		const cookies = ["access-token", "refresh-token", "csrftoken"];
		cookies.forEach((name) => {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
	};

	async function handleGoogleCallback() {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");

		clearAuthCookies();
		try {
			const response = await api.post(
				`${BASE_URL}/auth/google/`,
				{ code: code },
				{
					withCredentials: false,
					headers: { "Content-Type": "application/json" },
				},
			);

			localStorage.setItem("user", JSON.stringify(response.data.user));
			toast.success("Login Successful!");

			toast.success("Login Successful!");
			setTimeout(() => {
				window.location.href = "/";
			}, 1500);
		} catch (error) {
			const id = toast.error("Failed to log in. Please try again.");
			setTimeout(() => {
				toast.dismiss(id);
				window.location.href = "/login";
			}, 1000);
		}
	}
	useEffect(() => {
		handleGoogleCallback();
	}, []);

	return (
		<div>
			<Link to="/login">Home</Link>
		</div>
	);
};

export default GoogleCallback;
