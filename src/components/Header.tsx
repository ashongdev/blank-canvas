
import { Button } from "@/components/ui/button";
import TourButton from "@/components/TourButton"; // Adjust path if needed
import { Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderProps {
	onTourClick: () => void;
	onCreateClick?: () => void;
}

const Header = ({ onTourClick, onCreateClick }: HeaderProps) => {
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const location = useLocation();

	const handleCreateClick = () => {
		if (location.pathname !== '/' && onCreateClick) {
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
                        <Link to="/" className="hover:text-primary transition-smooth">
						    Certificate Generator
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
					<Button
						variant="ghost"
						size="icon"
						onClick={() =>
							setTheme(theme === "dark" ? "light" : "dark")
						}
						className="rounded-full"
					>
						<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</div>
			</div>
		</motion.header>
	);
};

export default Header;
