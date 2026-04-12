import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import axios from "axios";

interface AuthContextValue {
	userName: string;
	isAuthenticated: boolean;
	loading: boolean;
	refreshAuth: () => Promise<void>;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => void;
	BASE_URL: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [userName, setUserName] = useState("");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const BASE_URL = import.meta.env.VITE_BASE_URL;

	const refreshAuth = useCallback(async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${BASE_URL}/me`, {
				withCredentials: true,
			});

			if (response.data) {
				const serverUser = response.data;
				const resolvedName =
					serverUser.first_name ||
					serverUser.username ||
					serverUser.email ||
					"User";

				setUserName(resolvedName);
				setIsAuthenticated(true);
				return;
			}

			setIsAuthenticated(false);
			setUserName("");
		} catch {
			setIsAuthenticated(false);
			setUserName("");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refreshAuth();
	}, [refreshAuth]);

	const logout = useCallback(() => {
		localStorage.removeItem("auth");
		localStorage.removeItem("user");
		setIsAuthenticated(false);
		setUserName("");
	}, []);

	const value = useMemo(
		() => ({
			userName,
			isAuthenticated,
			loading,
			refreshAuth,
			setIsAuthenticated,
			logout,
			BASE_URL,
		}),
		[userName, isAuthenticated, loading, refreshAuth, logout, BASE_URL],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export default AuthContext;
