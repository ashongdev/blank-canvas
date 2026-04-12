import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const EditorAuthFooter = ({ setIsAuthenticated, isAuthenticated, loading }) => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("auth");
		localStorage.removeItem("user");
		setIsAuthenticated(false);
		toast.success("Logged out successfully");
		navigate("/login");
	};

	if (loading) return null;

	return (
		<div className="fixed bottom-6 left-6 flex items-center gap-3">
			{isAuthenticated ? (
				<>
					<Button
						variant="ghost"
						className="w-full justify-start text-muted-foreground hover:text-destructive"
						onClick={handleLogout}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Log out
					</Button>
				</>
			) : (
				<Button
					size="sm"
					onClick={() => navigate("/login")}
					className="gap-2"
				>
					<LogIn className="h-4 w-4" />
					Login
				</Button>
			)}
		</div>
	);
};

export default EditorAuthFooter;
