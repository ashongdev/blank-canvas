import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggler from "@/components/dashboard/ThemeToggler";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";
import { LogOut, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const sections = [
	{ no: "01", title: "Overview", url: "/dashboard", exact: true },
	{ no: "02", title: "Templates", url: "/dashboard/templates" },
	{ no: "03", title: "Collections", url: "/dashboard/collections" },
	{ no: "04", title: "Trash", url: "/dashboard/trash" },
	{ no: "05", title: "Marketplace", url: "/marketplace" },
];

const today = new Date().toLocaleDateString(undefined, {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
});

const DashboardMasthead = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, userName, logout } = useAuthContext();

	const initials =
		userName
			.trim()
			.split(/\s+/)
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";

	const handleLogout = () => {
		localStorage.removeItem("auth_token");
		logout();
		navigate("/login");
	};

	return (
		<header className="border-b-4 border-foreground bg-background">
			{/* Issue line */}
			<div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 pt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:px-8">
				<span>Vol. I — Certificate Studio</span>
				<span className="hidden sm:inline">{today}</span>
			</div>

			{/* Nameplate */}
			<div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 pb-4 pt-1 sm:flex-row sm:items-end sm:justify-between sm:px-8">
				<Link to="/" className="group flex items-baseline gap-3">
					<h1 className="font-playfair text-5xl font-bold italic tracking-tight text-foreground sm:text-6xl">
						genC
					</h1>
					<span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground sm:inline">
						The Certificate Desk
					</span>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button className="flex items-center gap-2.5 self-start rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-muted sm:self-auto">
							<Avatar className="h-8 w-8 border-2 border-foreground">
								<AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
									{initials}
								</AvatarFallback>
							</Avatar>
							<span className="text-xs uppercase tracking-[0.2em] text-foreground">
								{userName || "Account"}
							</span>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<div className="px-2 py-1.5">
							<p className="truncate text-sm font-medium text-foreground">
								{userName || "Account"}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{user?.email ?? ""}
							</p>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={handleLogout}
						>
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table of contents nav */}
			<nav className="border-t border-border bg-muted/40">
				<div className="mx-auto flex max-w-[1400px] items-center gap-5 overflow-x-auto px-5 py-2.5 sm:gap-7 sm:px-8">
					{sections.map((section, i) => {
						const isActive = section.exact
							? location.pathname === section.url
							: location.pathname.startsWith(section.url);
						return (
							<div key={section.url} className="flex shrink-0 items-center gap-5 sm:gap-7">
								{i > 0 && (
									<span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
								)}
								<Link
									to={section.url}
									className={cn(
										"group flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-xs uppercase tracking-[0.15em] transition-colors",
										isActive
											? "text-primary"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<span className="font-playfair text-[11px] italic">
										{section.no}
									</span>
									<span
										className={cn(
											"pb-0.5",
											isActive
												? "border-b-2 border-primary font-semibold"
												: "border-b-2 border-transparent group-hover:border-border",
										)}
									>
										{section.title}
									</span>
								</Link>
							</div>
						);
					})}
					<div className="ml-auto shrink-0 pl-2">
						<ThemeToggler />
					</div>
				</div>
			</nav>
		</header>
	);
};

export default DashboardMasthead;
