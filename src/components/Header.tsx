import TourButton from "@/components/TourButton"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";
import { Laptop, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
	onTourClick: () => void;
	onCreateClick?: () => void;
}

const Header = ({ onTourClick, onCreateClick }: HeaderProps) => {
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();
	const selectedTheme = theme ?? "system";
	const themeOptions = ["system", "light", "dark"] as const;
	const selectedThemeIndex = Math.max(
		themeOptions.indexOf(selectedTheme as (typeof themeOptions)[number]),
		0,
	);

	const handleCreateClick = () => {
		if (location.pathname !== "/" && onCreateClick) {
			navigate("/");
			// We need a way to trigger the click *after* navigation, OR
			// simply navigate to '/' and let the user click "Upload" or handle it via URL state?
			// Re-think: Is it better to just navigate to / and open upload dialog?
			// If we are already at /, execute onCreateClick.
			// If not, navigate to /? But we can't execute the callback from another component easily.
			// Simplified approach: Just navigate to /. The user can then click upload.
		} else if (onCreateClick) {
			onCreateClick();
		} else {
			navigate("/");
		}
	};

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="border-b border-border flex-shrink-0 bg-background"
		>
			<div className="container mx-auto px-6 py-6 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<h1 className="text-2xl font-semibold tracking-tight">
						<Link
							to="/"
							className="hover:text-primary transition-smooth"
						>
							genC
						</Link>
					</h1>
					<nav className="flex items-center gap-4 hidden md:flex">
						<Link
							to="/"
							className={`text-sm transition-smooth ${
								location.pathname === "/"
									? "font-medium text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Editor
						</Link>
						<Link
							to="/admin"
							className={`text-sm transition-smooth ${
								location.pathname === "/admin"
									? "font-medium text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Admin
						</Link>
						<Link
							to="/participant"
							className={`text-sm transition-smooth ${
								location.pathname === "/participant"
									? "font-medium text-primary"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Get Certificate
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<Button className="gap-2" onClick={handleCreateClick}>
						<Upload className="w-4 h-4" />
						Create & Share
					</Button>

					<TourButton onClick={onTourClick} />
					<ToggleGroup
						type="single"
						value={selectedTheme}
						onValueChange={(value) => {
							if (value) setTheme(value);
						}}
						variant="default"
						size="sm"
						className="relative rounded-full border border-border bg-background/80 p-1"
					>
						<motion.span
							aria-hidden="true"
							animate={{ x: `${selectedThemeIndex * 100}%` }}
							transition={{
								type: "spring",
								stiffness: 450,
								damping: 35,
							}}
							className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-foreground"
						/>
						<ToggleGroupItem
							value="system"
							aria-label="Use system theme"
							className="relative z-10 rounded-full px-2.5 text-muted-foreground data-[state=on]:bg-transparent data-[state=on]:text-background"
						>
							<Laptop className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="light"
							aria-label="Use light theme"
							className="relative z-10 rounded-full px-2.5 text-muted-foreground data-[state=on]:bg-transparent data-[state=on]:text-background"
						>
							<Sun className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="dark"
							aria-label="Use dark theme"
							className="relative z-10 rounded-full px-2.5 text-muted-foreground data-[state=on]:bg-transparent data-[state=on]:text-background"
						>
							<Moon className="h-4 w-4" />
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>
		</motion.header>
	);
};

export default Header;
