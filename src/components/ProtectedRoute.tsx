import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const [loading, setLoading] = useState(true);
	const [authed, setAuthed] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_URL}/me`,
					{
						credentials: "include",
					},
				);
				setAuthed(response.ok);
			} catch (error) {
				setAuthed(false);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	if (loading) return null;
	if (!authed) return <Navigate to="/" />;

	return <>{children}</>;
};

export default ProtectedRoute;
