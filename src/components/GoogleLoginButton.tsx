const GoogleLoginButton = () => {
	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const handleLogin = () => {
		// 1. Configuration (Must match your Google Cloud Console & Django settings)
		const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
		const REDIRECT_URI =
			"http://localhost:8080/accounts/google/login/callback/";
		const CLIENT_ID = `${GOOGLE_CLIENT_ID}.apps.googleusercontent.com`;
		const SCOPE = [
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		].join(" ");

		// 2. Build the URL
		const params = new URLSearchParams({
			response_type: "code",
			client_id: CLIENT_ID,
			redirect_uri: REDIRECT_URI,
			scope: SCOPE,
			// prompt: "select_account", // Optional: Forces account selection every time
		});

		console.log(GOOGLE_AUTH_URL);
		// 3. Redirect user to Google
		window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
	};

	return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default GoogleLoginButton;
