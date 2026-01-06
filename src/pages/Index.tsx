import CertificatePreview from "@/components/CertificatePreview";
import ControlPanel from "@/components/ControlPanel";
import PositionControls from "@/components/PositionControls";
import RecipientManager from "@/components/RecipientManager";
import TourButton from "@/components/TourButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { indexPageTourSteps, TOUR_STORAGE_KEYS } from "@/config/tourSteps";
import { useTour } from "@/hooks/useTour";
import axios from "axios";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Recipient {
	name: string;
	email: string;
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Index = () => {
	const { theme, setTheme } = useTheme();
	const { startTour, resetTour } = useTour({
		steps: indexPageTourSteps,
		storageKey: TOUR_STORAGE_KEYS.index,
		autoStart: true,
	});
	const [templateFile, setTemplateFile] = useState<File | null>(null);
	const [templateUrl, setTemplateUrl] = useState<string | null>(
		"https://res.cloudinary.com/demtelhcc/image/upload/TESTING.png"
	);
	const [showPreview, setShowPreview] = useState(true);
	const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
	const [selectedFont, setSelectedFont] = useState(
		"Bickham Script Pro Regular"
	);
	const [fontSize, setFontSize] = useState(48);
	const [fontWeight, setFontWeight] = useState("300");
	const [textColor, setTextColor] = useState("#000000");
	const [previewName, setPreviewName] = useState("John Doe");
	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const [anchorMode, setAnchorMode] = useState<"center" | "left">("center");
	const previewRef = useRef<HTMLDivElement>(null);

	const imgRef = useRef<HTMLImageElement>(null);
	const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (imgRef.current) {
			const { width, height } = imgRef.current.getBoundingClientRect();
			setDisplayedSize({ width, height });
		}
	}, [templateUrl]);

	const handleTemplateUpload = (file: File) => {
		setTemplateFile(file);
		const url = URL.createObjectURL(file);
		setTemplateUrl(url);

		toast.success("Template loaded locally");
	};

	useEffect(() => {
		return () => {
			if (templateUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(templateUrl);
			}
		};
	}, [templateUrl]);

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
		if (!templateFile) {
			toast.error("Please upload a template first");
			return;
		}

		// if (recipients.length === 0) {
		// 	toast.error("Please add at least one recipient");
		// 	return;
		// }

		const formData = new FormData();
		formData.append("template", templateFile);
		formData.append("recipients", JSON.stringify(recipients));
		formData.append(
			"textPosition",
			JSON.stringify({ x: textPosition.x, y: textPosition.y })
		);
		formData.append("selectedFont", selectedFont);
		formData.append("fontSize", fontSize.toString());
		formData.append("fontWeight", fontWeight);
		formData.append("textColor", textColor);
		formData.append("anchorMode", anchorMode);
		formData.append("inEditor", "true");
		formData.append("participantName", previewName);

		try {
			const response = await axios.post(
				`${BASE_URL}/generate/`,
				formData,
				{ responseType: "blob" }
			);

			const url = URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${previewName}.png`;
			link.click();
			URL.revokeObjectURL(url);

			toast.success("Download Complete.");
		} catch (error) {
			toast.error("Failed to generate certificates");
		}
	};

	const handleDownloadAndMail = () => {
		if (!templateUrl) {
			toast.error("Please upload a template first");
			return;
		}
		if (recipients.length === 0) {
			toast.error("Please add at least one recipient");
			return;
		}
		toast.success("Generating and mailing certificates...");
		// Generation + mailing logic will be implemented by user
	};

	return (
		<div className="min-h-screen bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="border-b border-border flex-shrink-0"
			>
				<div className="container mx-auto px-6 py-6 flex items-center justify-between">
					<div className="flex items-center gap-6">
						<h1 className="text-2xl font-semibold tracking-tight">
							Certificate Generator
						</h1>
						<nav className="flex items-center gap-4">
							<span className="text-sm font-medium text-primary">
								Editor
							</span>
							<a
								href="/admin"
								className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								Admin
							</a>
							<a
								href="/participant"
								className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								Get Certificate
							</a>
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
				<Tabs defaultValue="editor" className="h-full flex flex-col">
					<div className="border-b border-border flex-shrink-0">
					<div className="container mx-auto px-6">
							<TabsList className="bg-transparent h-12 p-0" data-tour="tabs">
								<TabsTrigger
									value="editor"
									className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
								>
									Editor
								</TabsTrigger>
								<TabsTrigger
									value="recipients"
									className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
								>
									Recipients
								</TabsTrigger>
							</TabsList>
						</div>
					</div>

					<TabsContent
						value="editor"
						className="flex-1 overflow-hidden m-0"
					>
						<div className="h-full container mx-auto px-0 py-8">
							<div className="h-full grid grid-cols-[280px_1fr_280px] gap-8">
								{/* Left Controls */}
								<div className="h-full max-w-[264px]" data-tour="position-controls">
									<PositionControls
										onPositionChange={handlePositionChange}
										textPosition={textPosition}
										onManualPositionChange={
											handleManualPositionChange
										}
										previewName={previewName}
										onPreviewTextChange={setPreviewName}
										anchorMode={anchorMode}
										onAnchorModeChange={setAnchorMode}
									/>
								</div>

								{/* Center Preview */}
								<div className="flex items-center justify-center" data-tour="certificate-preview">
									<CertificatePreview
										templateUrl={templateUrl}
										previewName={previewName}
										showPreview={showPreview}
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

								{/* Right Controls */}
								<div className="h-full max-w-[264px] px-2" data-tour="control-panel">
									<ControlPanel
										showPreview={showPreview}
										onPreviewToggle={setShowPreview}
										selectedFont={selectedFont}
										onFontChange={setSelectedFont}
										fontSize={fontSize}
										onFontSizeChange={setFontSize}
										fontWeight={fontWeight}
										onFontWeightChange={setFontWeight}
										textColor={textColor}
										onTextColorChange={setTextColor}
										onTemplateUpload={handleTemplateUpload}
										onGenerate={handleDownload}
										onGenerateAndMail={
											handleDownloadAndMail
										}
										hasTemplate={!!templateUrl}
									/>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value="recipients"
						className="flex-1 overflow-hidden m-0"
					>
						<div className="h-full overflow-auto">
							<RecipientManager
								recipients={recipients}
								onRecipientsChange={setRecipients}
							/>
						</div>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
};

export default Index;
