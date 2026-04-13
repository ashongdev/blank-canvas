import React from "react";

const useAuth = () => {
	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
	const handleGoogleLogin = () => {
		console.log("Logged in");
	};

	return { handleGoogleLogin };
};

export default useAuth;
