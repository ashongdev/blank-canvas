import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AnalyticsTracker from "./components/AnalyticsTracker";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Advanced from "./pages/Advanced";
import GoogleCallback from "./pages/GoogleCallback";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";
import Participant from "./pages/Participant";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/dashboard/DashboardLayout";

// Instantiated once, outside the component tree so it survives re-renders.
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 30_000,
		},
	},
});

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<AuthProvider>
					<AnalyticsTracker />
					<ErrorBoundary>
						<Routes>
							<Route path="/" element={<Index />} />
							<Route path="/marketplace" element={<Marketplace />} />
							<Route
								path="/advanced"
								element={
									<ProtectedRoute>
										<Advanced />
									</ProtectedRoute>
								}
							/>
							<Route path="/admin" element={<Admin />} />
							<Route path="/participant" element={<Participant />} />
							<Route
								path="/auth/google/callback"
								element={<GoogleCallback />}
							/>
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<Signup />} />
							<Route
								path="/dashboard/*"
								element={
									<ProtectedRoute>
										<DashboardLayout />
									</ProtectedRoute>
								}
							/>
							<Route path="*" element={<NotFound />} />
						</Routes>
					</ErrorBoundary>
				</AuthProvider>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
