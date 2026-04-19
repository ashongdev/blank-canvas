import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/hooks/useAuthContext";
import api from "@/services/axios";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const GoogleCallback = () => {
	const { BASE_URL } = useAuthContext();
	async function handleGoogleCallback() {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");

		const response = await api.post(
			`${BASE_URL}/auth/google/`,
			{ code },
			{
				headers: { "Content-Type": "application/json" },
			},
		);

		if (response.status === 200) {
			window.location.href = "/dashboard";
		}
	}

	useEffect(() => {
		handleGoogleCallback();
	}, []);
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
