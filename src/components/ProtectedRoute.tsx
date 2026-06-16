import { useAuthContext } from "@/hooks/useAuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, loading } = useAuthContext();
	const location = useLocation();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
