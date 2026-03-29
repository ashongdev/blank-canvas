import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import GoogleSvg from "@/components/ui/GoogleSvg";
import AuthButton from "@/components/AuthButton";
import GitHubSvg from "@/components/ui/GitHubSvg";
import useAuth from "@/hooks/useAuth";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const { handleGoogleLogin } = useAuth();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement authentication logic
		console.log("Login:", { email, password });
	};

	const handleGithubLogin = () => {
		// TODO: Implement GitHub OAuth
		console.log("GitHub login");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-[400px] space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Welcome back
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to your account to continue
					</p>
				</div>

				{/* Social Auth */}
				<div className="space-y-3">
					<AuthButton
						onClick={handleGoogleLogin}
						label="Continue with Google"
						svg={<GoogleSvg />}
					/>

					<AuthButton
						onClick={handleGithubLogin}
						label="Continue with GitHub"
						svg={<GitHubSvg />}
					/>
				</div>

				{/* Divider */}
				<div className="relative">
					<Separator />
					<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
						or
					</span>
				</div>

				{/* Email Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="email"
							className="text-sm font-medium text-foreground"
						>
							Email
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="h-11"
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="password"
								className="text-sm font-medium text-foreground"
							>
								Password
							</Label>
							<Link
								to="/forgot-password"
								className="text-xs text-primary hover:text-primary/80 transition-colors"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-11 pr-10"
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					<Button type="submit" className="w-full h-11 font-medium">
						Sign in
					</Button>
				</form>

				{/* Footer */}
				<p className="text-center text-sm text-muted-foreground">
					Don't have an account?{" "}
					<Link
						to="/signup"
						className="text-primary font-medium hover:text-primary/80 transition-colors"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;
