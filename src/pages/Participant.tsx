import CertificatePreview from "@/components/CertificatePreview";
import Header from "@/components/Header";
import ParticipantControlPanel from "@/components/ParticipantControlPanel";
import PositionControls from "@/components/PositionControls";
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
import { Label } from "@/components/ui/label";
import {
	participantPageTourSteps,
	TOUR_STORAGE_KEYS,
} from "@/config/tourSteps";
import { useTour } from "@/hooks/useTour";
import { TextField } from "@/types/TextField";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Search, Share2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Participant = () => {
	const { theme, setTheme } = useTheme();
	const [searchParams, setSearchParams] = useSearchParams();

	const { startTour, resetTour } = useTour({
		steps: participantPageTourSteps,
		storageKey: TOUR_STORAGE_KEYS.participant,
		autoStart: true,
	});

	const [certificateId, setCertificateId] = useState(
		searchParams.get("id") || "",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [templateUrl, setTemplateUrl] = useState<string | null>(null);
	const [templateLoaded, setTemplateLoaded] = useState(false);

	const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
	const [selectedFont, setSelectedFont] = useState(
		"Bickham Script Pro Regular",
	);
	const [fontSize, setFontSize] = useState(48);
	const [fontWeight, setFontWeight] = useState("400");
	const [textColor, setTextColor] = useState("#000000");
	const [participantName, setParticipantName] = useState("");
	const [anchorMode, setAnchorMode] = useState<"center" | "left">("center");
	const [isDownloading, setIsDownloading] = useState(false);
	const [isLocalDraft, setIsLocalDraft] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [generatedLink, setGeneratedLink] = useState("");

	const [fields, setFields] = useState<TextField[]>([]);

	// New state for shared link flow
	const [isSharedLinkFlow, setIsSharedLinkFlow] = useState(false);
	const [showNameInputDialog, setShowNameInputDialog] = useState(false);
	const [hasDownloaded, setHasDownloaded] = useState(false);

	const previewRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Auto-load if ID is in URL (shared link flow)
	useEffect(() => {
		const id = searchParams.get("id");

		// Legacy parameters
		const font = searchParams.get("font");
		const size = searchParams.get("size");
		const weight = searchParams.get("weight");
		const color = searchParams.get("color");
		const x = searchParams.get("x");
		const y = searchParams.get("y");
		const anchor = searchParams.get("anchor");

		// New encoded data parameter
		const dataEncoded = searchParams.get("data");

		if (id) {
			setCertificateId(id);

			if (dataEncoded) {
				try {
					const parsedFields: TextField[] = JSON.parse(
						atob(dataEncoded),
					);
					setFields(parsedFields);

					if (parsedFields.length > 0) {
						const mainField = parsedFields[0];
						setParticipantName(mainField.text);
						setSelectedFont(mainField.font);
						setFontSize(mainField.fontSize);
						setFontWeight(mainField.fontWeight);
						setTextColor(mainField.color);
						setTextPosition({ x: mainField.x, y: mainField.y });
						setAnchorMode(mainField.anchorMode);
					}

					setIsSharedLinkFlow(true);
					handleFetchTemplate(id, true);
				} catch (e) {
					console.error("Failed to parse field data", e);
					handleFetchTemplate(id, false);
				}
			} else if (font && size && weight && color && x && y) {
				setSelectedFont(font);
				setFontSize(Number(size));
				setFontWeight(weight);
				setTextColor(color);
				setTextPosition({ x: Number(x), y: Number(y) });
				setAnchorMode(anchor as "center" | "left");

				setFields([
					{
						id: "legacy",
						label: "Participant Name",
						text: "",
						x: Number(x),
						y: Number(y),
						font: font,
						fontSize: Number(size),
						fontWeight: weight,
						color: color,
						anchorMode: (anchor as "center" | "left") || "center",
					},
				]);

				setIsSharedLinkFlow(true);
				handleFetchTemplate(id, true);
			} else {
				handleFetchTemplate(id, false);
			}
		}
	}, [searchParams]);

	const CLOUD_NAME = "demtelhcc";

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setTemplateUrl(url);
			setTemplateLoaded(true);
			setSelectedFile(file);
			setIsLocalDraft(true);

			setSearchParams({});
			setCertificateId("");

			setTextPosition({ x: 0, y: 0 });
			setSelectedFont("Bickham Script Pro Regular");
			setFontSize(48);
			toast.success(
				"Image loaded. Adjust settings and click Share to publish.",
			);
		}
	};

	const handlePublish = async () => {
		if (!selectedFile) return;

		const toastId = toast.loading("Uploading and saving configuration...");

		try {
			const formData = new FormData();
			formData.append("template", selectedFile);
			formData.append("selectedFont", selectedFont);
			formData.append("fontSize", fontSize.toString());
			formData.append("fontWeight", fontWeight);
			formData.append("textColor", textColor);
			formData.append("x", textPosition.x.toString());
			formData.append("y", textPosition.y.toString());
			formData.append("anchorMode", anchorMode);

			const res = await axios.post(`${BASE_URL}/upload/`, formData);

			if (res.data.public_id) {
				const newId = res.data.public_id;
				setCertificateId(newId);
				setSearchParams({ id: newId });
				setIsLocalDraft(false);
				setSelectedFile(null);

				const link = `${window.location.origin}/participant?id=${newId}`;
				setGeneratedLink(link);
				setShowShareDialog(true);

				toast.dismiss(toastId);
				toast.success("Published successfully!");
			}
		} catch (error) {
			console.error(error);
			toast.dismiss(toastId);
			toast.error("Failed to publish.");
		}
	};

	const handleFetchTemplate = async (
		id?: string,
		isFromSharedLink = false,
	) => {
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
				"Failed to fetch template. Please check the ID and try again.",
			);
			setTemplateUrl(null);
			setIsLoading(false);
			return;
		}

		if (idToUse.toLowerCase().includes("notfound")) {
			setError(
				"Certificate template not found. The ID may be invalid or expired.",
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

			// Show name input dialog for shared link flow
			if (isFromSharedLink) {
				setShowNameInputDialog(true);
			} else {
				toast.success("Template loaded successfully!");
			}

			//  Fetch presets from backend
			// try {
			// 	const presetRes = await axios.get(
			// 		`${BASE_URL}/get_preset/${idToUse}/`,
			// 	);
			// 	const data = presetRes.data;

			// 	if (data) {
			// 		setSelectedFont(data.selectedFont);
			// 		setFontSize(data.fontSize);
			// 		setFontWeight(data.fontWeight);
			// 		setTextColor(data.textColor);
			// 		setTextPosition(data.textPosition);
			// 		setAnchorMode(data.anchorMode);
			// 	}
			// } catch (err) {
			// 	console.log("No presets found, using defaults.");
			// }
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
			// Update fields with current participant name (first field)
			let currentFields = [...fields];
			if (currentFields.length > 0) {
				currentFields[0] = {
					...currentFields[0],
					text: participantName,
					x: textPosition.x,
					y: textPosition.y,
					font: selectedFont,
					fontSize: fontSize,
					fontWeight: fontWeight,
					color: textColor,
					anchorMode: anchorMode,
				};
			} else {
				// Fallback if no fields exist yet
				currentFields = [
					{
						id: "participant",
						label: "Participant Name",
						text: participantName,
						x: textPosition.x,
						y: textPosition.y,
						font: selectedFont,
						fontSize: fontSize,
						fontWeight: fontWeight,
						color: textColor,
						anchorMode: anchorMode,
					},
				];
			}

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
					anchorMode,
					certificateId,
					participantName,
					fields: JSON.stringify(currentFields),
				},
				{ responseType: "blob" },
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

	const handleSharedFlowDownload = async () => {
		if (!participantName.trim()) {
			toast.error("Please enter your name");
			return;
		}

		setShowNameInputDialog(false);
		await handleDownload();
		setHasDownloaded(true);
	};

	const handleNameInputKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter" && participantName.trim()) {
			handleSharedFlowDownload();
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<Header
				onTourClick={() => {
					resetTour();
					startTour();
				}}
			/>

			{/* Name Input Dialog for Shared Link Flow */}
			<Dialog
				open={showNameInputDialog}
				onOpenChange={setShowNameInputDialog}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl">
							Enter Your Name
						</DialogTitle>
						<DialogDescription>
							Type your name below to generate your personalized
							certificate.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="participant-name">Your Name</Label>
							<Input
								id="participant-name"
								value={participantName}
								onChange={(e) =>
									setParticipantName(e.target.value)
								}
								onKeyDown={handleNameInputKeyDown}
								placeholder="Enter your full name..."
								autoFocus
							/>
						</div>
						<Button
							onClick={handleSharedFlowDownload}
							disabled={!participantName.trim() || isDownloading}
							className="w-full"
						>
							{isDownloading ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : null}
							Generate & Download Certificate
						</Button>
					</div>
				</DialogContent>
			</Dialog>

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
														e.target.value,
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
				) : isSharedLinkFlow ? (
					// Simplified Shared Link View - Only Certificate Preview
					<div className="h-full flex flex-col items-center justify-center p-6">
						<div className="w-full max-w-4xl">
							<CertificatePreview
								templateUrl={templateUrl}
								fields={
									fields.length > 0
										? fields.map((f, i) =>
												i === 0
													? {
															...f,
															text:
																participantName ||
																"Your Name",
														}
													: f,
											)
										: [
												{
													id: "preview",
													label: "Preview",
													text:
														participantName ||
														"Your Name",
													x: textPosition.x,
													y: textPosition.y,
													font: selectedFont,
													fontSize: fontSize,
													fontWeight: fontWeight,
													color: textColor,
													anchorMode: anchorMode,
												},
											]
								}
								selectedFieldId={fields[0]?.id || "preview"}
								onFieldSelect={() => {}}
								showPreview={true}
								previewRef={previewRef}
								imgRef={imgRef}
								isParticipant={true}
							/>

							{hasDownloaded && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="mt-6 flex flex-col items-center gap-4"
								>
									<p className="text-muted-foreground text-center">
										Your certificate has been downloaded!
									</p>
									<div className="flex gap-3">
										<Button
											variant="outline"
											onClick={() => {
												setShowNameInputDialog(true);
												setHasDownloaded(false);
											}}
										>
											Download Again
										</Button>
										<Button
											variant="ghost"
											onClick={() => {
												setIsSharedLinkFlow(false);
												setHasDownloaded(false);
											}}
										>
											Advanced Editor
										</Button>
									</div>
								</motion.div>
							)}
						</div>
					</div>
				) : (
					// Full Certificate Editor View
					<>
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
										anchorMode={anchorMode}
										onAnchorModeChange={setAnchorMode}
									/>
								</div>

								{/* Center Preview */}
								<div className="flex items-center justify-center">
									<CertificatePreview
										templateUrl={templateUrl}
										fields={
											fields.length > 0
												? fields.map((f, i) =>
														i === 0
															? {
																	...f,
																	text:
																		participantName ||
																		"Your Name",
																}
															: f,
													)
												: [
														{
															id: "preview",
															label: "Preview",
															text:
																participantName ||
																"Your Name",
															x: textPosition.x,
															y: textPosition.y,
															font: selectedFont,
															fontSize: fontSize,
															fontWeight:
																fontWeight,
															color: textColor,
															anchorMode:
																anchorMode,
														},
													]
										}
										selectedFieldId={
											fields[0]?.id || "preview"
										}
										onFieldSelect={() => {}}
										showPreview={true}
										previewRef={previewRef}
										imgRef={imgRef}
										isParticipant={true}
									/>
								</div>

								{/* Right Controls - Styling & Download */}
								<div className="h-full max-w-[264px] flex flex-col gap-4">
									<ParticipantControlPanel
										participantName={participantName}
										onParticipantNameChange={
											setParticipantName
										}
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
											setIsLocalDraft(false);
										}}
										hasName={!!participantName.trim()}
									/>
									{isLocalDraft && (
										<Button
											onClick={handlePublish}
											className="w-full gap-2"
											variant="secondary"
										>
											<Share2 className="w-4 h-4" />
											Publish & Share
										</Button>
									)}
								</div>
							</div>
						</div>

						<Dialog
							open={showShareDialog}
							onOpenChange={setShowShareDialog}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Certificate Published!
									</DialogTitle>
									<DialogDescription>
										Share this link with your participants
										to let them fill their details.
									</DialogDescription>
								</DialogHeader>
								<div className="flex items-center space-x-2">
									<div className="grid flex-1 gap-2">
										<Label
											htmlFor="link"
											className="sr-only"
										>
											Link
										</Label>
										<Input
											id="link"
											defaultValue={generatedLink}
											readOnly
										/>
									</div>
									<Button
										size="sm"
										className="px-3"
										onClick={() => {
											navigator.clipboard.writeText(
												generatedLink,
											);
											toast.success(
												"Copied to clipboard",
											);
										}}
									>
										<span className="sr-only">Copy</span>
										Copy
									</Button>
								</div>
							</DialogContent>
						</Dialog>
					</>
				)}
			</main>
		</div>
	);
};

export default Participant;
