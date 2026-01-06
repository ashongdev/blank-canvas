import CertificatePreview from "@/components/CertificatePreview";
import ParticipantControlPanel from "@/components/ParticipantControlPanel";
import PositionControls from "@/components/PositionControls";
import TourButton from "@/components/TourButton";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { participantPageTourSteps, TOUR_STORAGE_KEYS } from "@/config/tourSteps";
import { useTour } from "@/hooks/useTour";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Participant = () => {
	const { theme, setTheme } = useTheme();
	const [searchParams] = useSearchParams();

	const { startTour, resetTour } = useTour({
		steps: participantPageTourSteps,
		storageKey: TOUR_STORAGE_KEYS.participant,
		autoStart: true,
	});

	const [certificateId, setCertificateId] = useState(
		searchParams.get("id") || ""
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [templateUrl, setTemplateUrl] = useState<string | null>(null);
	const [templateLoaded, setTemplateLoaded] = useState(false);

	const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
	const [selectedFont, setSelectedFont] = useState(
		"Bickham Script Pro Regular"
	);
	const [fontSize, setFontSize] = useState(48);
	const [fontWeight, setFontWeight] = useState("400");
	const [textColor, setTextColor] = useState("#000000");
	const [participantName, setParticipantName] = useState("");
	const [anchorMode, setAnchorMode] = useState<"center" | "left">("center");
	const [isDownloading, setIsDownloading] = useState(false);

	const previewRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	// Auto-load if ID is in URL
	useEffect(() => {
		const id = searchParams.get("id");
		if (id) {
			setCertificateId(id);
			handleFetchTemplate(id);
		}
	}, [searchParams]);

	const CLOUD_NAME = "demtelhcc";
	const handleFetchTemplate = async (id?: string) => {
		const idToUse = id || certificateId;

		if (!idToUse.trim()) {
			setError("Please enter a certificate ID");
			return;
		}

		setIsLoading(true);
		setError(null);
		setTemplateLoaded(false);

		if (idToUse.toLowerCase().includes("error")) {
			setError(
				"Failed to fetch template. Please check the ID and try again."
			);
			setTemplateUrl(null);
			setIsLoading(false);
			return;
		}

		if (idToUse.toLowerCase().includes("notfound")) {
			setError(
				"Certificate template not found. The ID may be invalid or expired."
			);
			setTemplateUrl(null);
			setIsLoading(false);
			return;
		}

		const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${idToUse}.png`;
		try {
			const res = await axios.get(url);
			if (!res.data) throw new Error("Template not found");
			setTemplateUrl(url);
			setTemplateLoaded(true);
			toast.success("Template loaded successfully!");
		} catch {
			toast.dismiss();
			toast.error("Template not found. Check the ID.");
			setError("Template not found. Check the ID.");
		}

		setTemplateLoaded(true);
		setIsLoading(false);
	};

	const handlePositionChange = (axis: "x" | "y", direction: number) => {
		setTextPosition((prev) => ({
			...prev,
			[axis]: prev[axis] + direction,
		}));
	};

	const handleManualPositionChange = (axis: "x" | "y", value: number) => {
		setTextPosition((prev) => ({
			...prev,
			[axis]: value,
		}));
	};

	const handleDownload = async () => {
		if (!participantName.trim()) {
			toast.error("Please enter your name");
			return;
		}

		setIsDownloading(true);
		if (!templateUrl) {
			toast.error("Please upload a template first");
			return;
		}

		toast.success("Generating certificates...");

		try {
			const response = await axios.post(
				`${BASE_URL}/generate/`,
				{
					textPosition: {
						x: textPosition.x,
						y: textPosition.y,
					},
					selectedFont,
					fontSize: fontSize,
					fontWeight,
					textColor,
					certificateId,
					participantName,
					anchorMode,
				},
				{ responseType: "blob" }
			);

			const url = window.URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${participantName}.png`;
			link.click();
			window.URL.revokeObjectURL(url);

			toast.success("Download Complete.");
		} catch (error) {
			console.log("Error generating certificates:", error);
			toast.error("Failed to generate certificates");
		} finally {
			setIsDownloading(false);
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
								className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								Admin
							</Link>
							<Link
								to="/participant"
								className="text-sm font-medium text-primary"
							>
								Get Certificate
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-2">
						<TourButton onClick={() => { resetTour(); startTour(); }} />
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

			{/* Main Content */}
			<main className="flex-1 overflow-hidden">
				{!templateLoaded ? (
					// ID Entry View
					<div className="h-full flex items-center justify-center p-6">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="w-full max-w-md"
						>
							<Card className="shadow-medium">
								<CardHeader className="text-center space-y-2">
									<CardTitle className="text-2xl">
										Get Your Certificate
									</CardTitle>
									<CardDescription>
										Enter the certificate ID provided by
										your event organizer
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="space-y-2">
										<label className="text-sm font-medium">
											Certificate ID
										</label>
										<div className="flex gap-2">
											<Input
												data-tour="certificate-id-input"
												value={certificateId}
												onChange={(e) => {
													setCertificateId(
														e.target.value
													);
													setError(null);
												}}
												placeholder="Enter certificate ID..."
												className="font-mono"
												disabled={isLoading}
											/>
											<Button
												data-tour="retrieve-btn"
												onClick={() =>
													handleFetchTemplate()
												}
												disabled={
													isLoading ||
													!certificateId.trim()
												}
												className="flex-shrink-0"
											>
												{isLoading ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : (
													<Search className="w-4 h-4" />
												)}
											</Button>
										</div>
									</div>

									{error && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
										>
											<AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
											<p className="text-sm text-destructive">
												{error}
											</p>
										</motion.div>
									)}

									<div className="text-center text-sm text-muted-foreground">
										<p>
											Don't have an ID? Contact your event
											organizer.
										</p>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				) : (
					// Certificate Editor View
					<div className="h-full container mx-auto px-6 py-8">
						<div className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8">
							{/* Left Controls - Position */}
							<div className="hidden lg:block h-full max-w-[264px]">
								<PositionControls
									onPositionChange={handlePositionChange}
									textPosition={textPosition}
									onManualPositionChange={
										handleManualPositionChange
									}
									previewName={participantName || "Your Name"}
									onPreviewTextChange={setParticipantName}
									anchorMode={anchorMode}
									onAnchorModeChange={setAnchorMode}
								/>
							</div>

							{/* Center Preview */}
							<div className="flex items-center justify-center">
								<CertificatePreview
									templateUrl={templateUrl}
									previewName={participantName || "Your Name"}
									showPreview={true}
									textPosition={textPosition}
									selectedFont={selectedFont}
									imgRef={imgRef}
									fontSize={fontSize}
									fontWeight={fontWeight}
									previewRef={previewRef}
									textColor={textColor}
									anchorMode={anchorMode}
								/>
							</div>

							{/* Right Controls - Styling & Download */}
							<div className="h-full max-w-[264px]">
								<ParticipantControlPanel
									participantName={participantName}
									onParticipantNameChange={setParticipantName}
									selectedFont={selectedFont}
									onFontChange={setSelectedFont}
									fontSize={fontSize}
									onFontSizeChange={setFontSize}
									fontWeight={fontWeight}
									onFontWeightChange={setFontWeight}
									textColor={textColor}
									onTextColorChange={setTextColor}
									onDownload={handleDownload}
									onBack={() => {
										setTemplateLoaded(false);
										setTemplateUrl(null);
										setParticipantName("");
									}}
									hasName={!!participantName.trim()}
								/>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default Participant;
