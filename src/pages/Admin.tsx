import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Copy, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Admin = () => {
	const { theme, setTheme } = useTheme();
	const [isUploading, setIsUploading] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [generatedId, setGeneratedId] = useState("");
	const [copied, setCopied] = useState(false);
	const [publicId, setPublicId] = useState("");

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("template", file);

		setIsUploading(true);
		try {
			const CLOUD_NAME = "demtelhcc";
			const UPLOAD_PRESET = "certificate_upload";

			const cloudinaryForm = new FormData();
			cloudinaryForm.append("file", file);
			cloudinaryForm.append("upload_preset", UPLOAD_PRESET);
			cloudinaryForm.append("public_id", publicId);

			const res = await axios.post(
				`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
				cloudinaryForm
			);

			setGeneratedId(res.data.public_id);
			setShowSuccessModal(true);
			toast.success("Template uploaded successfully");
		} catch (error) {
			toast.error("Failed to upload template");
		} finally {
			setIsUploading(false);
		}
	};

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(generatedId);
			setCopied(true);
			toast.success("ID copied to clipboard!");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy ID");
		}
	};

	const shareUrl = `${window.location.origin}/participant?id=${generatedId}`;

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success("Share URL copied to clipboard!");
		} catch (error) {
			toast.error("Failed to copy URL");
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="border-b border-border flex-shrink-0"
			>
				<div className="container mx-auto px-6 py-6 flex items-center justify-between">
					<div className="flex items-center gap-6">
						<Link
							to="/"
							className="text-2xl font-semibold tracking-tight hover:text-primary transition-smooth"
						>
							Certificate Generator
						</Link>
						<nav className="flex items-center gap-4">
							<Link
								to="/"
								className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								Editor
							</Link>
							<Link
								to="/admin"
								className="text-sm font-medium text-primary"
							>
								Admin
							</Link>
							<Link
								to="/participant"
								className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								Get Certificate
							</Link>
						</nav>
					</div>
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
			</motion.header>

			{/* Main Content */}
			<main className="flex-1 flex items-center justify-center p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="w-full max-w-lg"
				>
					<Card className="shadow-medium">
						<CardHeader className="text-center space-y-2">
							<CardTitle className="text-2xl">
								Upload Certificate Template
							</CardTitle>
							<CardDescription>
								Upload your certificate template and share the
								unique ID with participants
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Public ID Input */}
							<div className="space-y-2">
								<label
									htmlFor="public-id"
									className="text-sm font-medium"
								>
									Public ID
								</label>
								<Input
									id="public-id"
									placeholder="Enter the public id for the certificate template"
									value={publicId}
									onChange={(e) =>
										setPublicId(e.target.value)
									}
									className="font-mono text-sm"
								/>
								<p className="text-xs text-muted-foreground">
									This ID will be used to retrieve the
									template from Cloudinary
								</p>
							</div>

							<label
								htmlFor="admin-template-upload"
								className="block"
							>
								<input
									id="admin-template-upload"
									type="file"
									accept="image/*"
									onChange={handleFileUpload}
									className="hidden"
									disabled={isUploading}
								/>
								<div className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-smooth">
									{isUploading ? (
										<div className="flex flex-col items-center gap-4">
											<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
											<p className="text-sm text-muted-foreground">
												Uploading template...
											</p>
										</div>
									) : (
										<div className="flex flex-col items-center gap-4">
											<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
												<Upload className="w-8 h-8 text-muted-foreground" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium">
													Click to upload template
												</p>
												<p className="text-xs text-muted-foreground">
													PNG, JPG, or PDF up to 10MB
												</p>
											</div>
										</div>
									)}
								</div>
							</label>

							<div className="text-center text-sm text-muted-foreground">
								After uploading, you'll receive a unique ID to
								share with participants
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</main>

			{/* Success Modal */}
			<Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
								<Check className="w-5 h-5 text-green-600 dark:text-green-400" />
							</div>
							Template Uploaded Successfully!
						</DialogTitle>
						<DialogDescription>
							Share the ID or URL below with your participants so
							they can download their personalized certificates.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
						{/* Certificate ID */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								Certificate ID
							</label>
							<div className="flex gap-2">
								<Input
									value={generatedId}
									readOnly
									className="font-mono text-sm bg-muted"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={handleCopyId}
									className="flex-shrink-0"
								>
									{copied ? (
										<Check className="w-4 h-4 text-green-600" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						{/* Share URL */}
						<div className="space-y-2">
							<label className="text-sm font-medium">
								Share URL
							</label>
							<div className="flex gap-2">
								<Input
									value={shareUrl}
									readOnly
									className="font-mono text-xs bg-muted"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={handleCopyUrl}
									className="flex-shrink-0"
								>
									<Copy className="w-4 h-4" />
								</Button>
							</div>
						</div>

						<div className="pt-4 border-t border-border">
							<Button
								className="w-full"
								onClick={() => setShowSuccessModal(false)}
							>
								Done
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Admin;
