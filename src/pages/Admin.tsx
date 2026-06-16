import Header from "@/components/Header";
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
import { adminPageTourSteps, TOUR_STORAGE_KEYS } from "@/config/tourSteps";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useTour } from "@/hooks/useTour";
import api from "@/services/axios";
import { motion } from "framer-motion";
import { Check, Copy, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Admin = () => {
	const { BASE_URL, isAuthenticated } = useAuthContext();
	const { startTour, resetTour } = useTour({
		steps: adminPageTourSteps,
		storageKey: TOUR_STORAGE_KEYS.admin,
		autoStart: true,
	});
	const [isUploading, setIsUploading] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [generatedId, setGeneratedId] = useState("");
	const [copied, setCopied] = useState(false);
	const [publicId, setPublicId] = useState("");

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.currentTarget.value = "";
		if (!file) return;

		if (!isAuthenticated) {
			toast.error("You must be signed in to upload templates.");
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("template", file);
			if (publicId.trim()) {
				formData.append("public_id", publicId.trim());
			}

			const res = await api.post<{ public_id: string }>(
				`${BASE_URL}/upload/`,
				formData,
			);

			if (res.data.public_id) {
				setGeneratedId(res.data.public_id);
				setShowSuccessModal(true);
				toast.success("Template uploaded successfully");
			}
		} catch {
			toast.error("Failed to upload template. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleCopyId = async () => {
		await navigator.clipboard.writeText(generatedId);
		setCopied(true);
		toast.success("ID copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
	};

	const shareUrl = `${window.location.origin}/participant?id=${generatedId}`;

	const handleCopyUrl = async () => {
		await navigator.clipboard.writeText(shareUrl);
		toast.success("Share URL copied to clipboard!");
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header
				onTourClick={() => {
					resetTour();
					startTour();
				}}
			/>

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
								Upload your certificate template and share the unique
								ID with participants
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2" data-tour="public-id">
								<label
									htmlFor="public-id"
									className="text-sm font-medium"
								>
									Public ID (optional)
								</label>
								<Input
									id="public-id"
									placeholder="Leave blank for auto-generated ID"
									value={publicId}
									onChange={(e) => setPublicId(e.target.value)}
									disabled={isUploading}
									className="font-mono text-sm"
								/>
								<p className="text-xs text-muted-foreground">
									Custom ID for your template (e.g. hackathon-2025)
								</p>
							</div>

							<div data-tour="admin-upload">
								<label htmlFor="admin-template-upload" className="block">
									<input
										id="admin-template-upload"
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={handleFileUpload}
										className="hidden"
										disabled={isUploading}
									/>
									<div className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
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
														PNG, JPG, or WEBP — max 10 MB
													</p>
												</div>
											</div>
										)}
									</div>
								</label>
							</div>

							{!isAuthenticated && (
								<p className="text-xs text-destructive text-center">
									You must be signed in to upload templates.
								</p>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</main>

			<Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
								<Check className="w-5 h-5 text-green-600 dark:text-green-400" />
							</div>
							Template Uploaded!
						</DialogTitle>
						<DialogDescription>
							Share the ID or URL below with your participants.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 mt-4">
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
								>
									{copied ? (
										<Check className="w-4 h-4 text-green-600" />
									) : (
										<Copy className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

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
