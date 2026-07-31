import DashboardMasthead from "@/components/dashboard/DashboardMasthead";
import DashboardRoutes from "./DashboardRoutes";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardLayout = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-background text-foreground">
			<DashboardMasthead />

			<main className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
				<DashboardRoutes />
			</main>

			<button
				onClick={() => navigate("/advanced")}
				className="group fixed bottom-6 right-5 z-40 flex -rotate-6 items-center gap-2 rounded-full border-2 border-foreground bg-primary px-5 py-3.5 text-primary-foreground shadow-[4px_4px_0_hsl(var(--foreground))] transition-all hover:rotate-0 hover:shadow-[6px_6px_0_hsl(var(--foreground))] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_hsl(var(--foreground))] sm:right-8"
			>
				<Plus className="h-4 w-4" strokeWidth={3} />
				<span className="text-xs font-bold uppercase tracking-[0.2em]">
					New Template
				</span>
			</button>
		</div>
	);
};

export default DashboardLayout;
