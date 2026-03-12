import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin";
import Advanced from "./pages/Advanced";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Participant from "./pages/Participant";

import AnalyticsTracker from "./components/AnalyticsTracker";
import GoogleCallback from "./components/GoogleCallback";

const queryClient = new QueryClient();

const App = () => {
	useEffect(() => {
		const wakeUpServer = async () => {
			try {
				const baseUrl = import.meta.env.VITE_BASE_URL;
				await fetch(`${baseUrl}/wake/`);
			} catch (error) {
				console.log("Server wake-up ping failed", error);
			}
		};

		wakeUpServer();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<AnalyticsTracker />
					<Routes>
						<Route path="/" element={<Index />} />
						<Route path="/advanced" element={<Advanced />} />
						<Route path="/admin" element={<Admin />} />
						<Route
							path="/accounts/google/login/callback"
							element={<GoogleCallback />}
						/>
						<Route path="/participant" element={<Participant />} />
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	);
};

export default App;
