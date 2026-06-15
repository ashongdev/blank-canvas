import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Advanced from "./pages/Advanced";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Participant from "./pages/Participant";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Marketplace from "./pages/Marketplace";

import AnalyticsTracker from "./components/AnalyticsTracker";
import GoogleCallback from "./pages/GoogleCallback";

const queryClient = new QueryClient();
const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<AuthProvider>
					<AnalyticsTracker />
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
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
