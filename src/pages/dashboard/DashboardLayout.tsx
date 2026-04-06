import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Navigate } from "react-router-dom";
import DashboardRoutes from "./DashboardRoutes";
import ThemeToggler from "@/components/dashboard/ThemeToggler";
import api from "@/services/axios";
import { useEffect, useState } from "react";
import { Template } from "@/types/Template";

const DashboardLayout = () => {
	// const isAuthenticated = !!localStorage.getItem("auth_token");

	// if (!isAuthenticated) {
	//   return <Navigate to="/login" replace />;
	// }
	const [templates, setTemplates] = useState<Template[]>([]);
	const BASE_URL = import.meta.env.VITE_BASE_URL;

	const fetchMyTemplates = async () => {
		try {
			const response = await api.get(`${BASE_URL}/my-templates`);
			console.log(response);
			setTemplates(response.data.templates);
		} catch (error) {
			console.log("📝 [DashboardLayout.tsx:16] error:", error);
		}
	};

	useEffect(() => {
		fetchMyTemplates();
	}, []);

	return (
		<SidebarProvider>
			<div className="min-h-screen flex w-full">
				<DashboardSidebar />
				<div className="flex-1 flex flex-col">
					<header className="h-14 flex items-center justify-between border-b border-border px-4">
						<div className="flex items-center gap-3">
							<SidebarTrigger />
							<h1 className="text-lg font-semibold text-foreground">
								Dashboard
							</h1>
						</div>
						<ThemeToggler />
					</header>
					<main className="flex-1 overflow-auto p-6">
						<DashboardRoutes
							templates={templates}
							setTemplates={setTemplates}
						/>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
};

export default DashboardLayout;
