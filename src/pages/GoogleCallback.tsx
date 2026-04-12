import api from "@/services/axios";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/hooks/useAuthContext";

const GoogleCallback = () => {
	const { BASE_URL } = useAuthContext();
	useEffect(() => {
		const handleGoogleCallback = async () => {
			const params = new URLSearchParams(window.location.search);
			const code = params.get("code");

			try {
				const response = await api.post(
					`${BASE_URL}/auth/google/`,
					{ code: code },
					{
						headers: { "Content-Type": "application/json" },
					},
				);

				localStorage.setItem(
					"user",
					JSON.stringify(response.data.user),
				);
				toast.success("Login Successful!");
				setTimeout(() => {
					window.location.href = "/dashboard";
				}, 1500);
			} catch (error) {
				const id = toast.error("Failed to log in. Please try again.");
				setTimeout(() => {
					toast.dismiss(id);
					window.location.href = "/login";
				}, 1000);
			}
		};

		handleGoogleCallback();
	}, [BASE_URL]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-[400px] space-y-6">
				<Card className="shadow-medium">
					<CardHeader className="text-center space-y-2">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
						<CardTitle className="text-2xl">
							Finishing Sign In
						</CardTitle>
						<CardDescription>
							We are verifying your Google account and redirecting
							you.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-center">
						<p className="text-sm text-muted-foreground">
							If this takes too long, go back to login and try
							again.
						</p>
						<Button
							asChild
							variant="outline"
							className="w-full h-11"
						>
							<Link to="/login">Back to Login</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default GoogleCallback;
