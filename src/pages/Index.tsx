import CertificatePreview from "@/components/CertificatePreview";
import ControlPanel from "@/components/ControlPanel";
import Header from "@/components/Header";
import PositionControls from "@/components/PositionControls";
import RecipientManager from "@/components/RecipientManager";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { indexPageTourSteps, TOUR_STORAGE_KEYS } from "@/config/tourSteps";
import { useTour } from "@/hooks/useTour";
import { TextField } from "@/types/TextField";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { logEvent } from "@/lib/analytics";

interface Recipient {
	name: string;
	email: string;
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Index = () => {
	const navigate = useNavigate();
	const location = useLocation();
	// const { theme, setTheme } = useTheme(); // Moved to Header
	const { startTour, resetTour } = useTour({
		steps: indexPageTourSteps,
		storageKey: TOUR_STORAGE_KEYS.index,
		autoStart: true,
	});
	const [templateFile, setTemplateFile] = useState<File | null>(
		location.state?.templateFile || null,
	);
	const [templateUrl, setTemplateUrl] = useState<string | null>(
		location.state?.templateUrl || null,
	);
	const [showPreview, setShowPreview] = useState(true);

	const [fields, setFields] = useState<TextField[]>(
		location.state?.fields || [
			{
				id: uuidv4(),
				label: "Participant Name",
				text: "John Doe",
				x: 0,
				y: 0,
				font: "Bickham Script Pro Regular",
				fontSize: 100,
				fontWeight: "300",
				color: "#000000",
				anchorMode: "center",
				required: true,
			},
		],
	);
	const [selectedFieldId, setSelectedFieldId] = useState<string>(
		fields[0].id,
	);

	const activeField =
		fields.find((f) => f.id === selectedFieldId) || fields[0];

	const [recipients, setRecipients] = useState<Recipient[]>([]);
	const previewRef = useRef<HTMLDivElement>(null);

	const imgRef = useRef<HTMLImageElement>(null);
	const [displayedSize, setDisplayedSize] = useState({ width: 0, height: 0 });
	const [showShareDialog, setShowShareDialog] = useState(false);
	const [generatedLink, setGeneratedLink] = useState("");
	const [showIdDialog, setShowIdDialog] = useState(false);
	const [customPublicId, setCustomPublicId] = useState("");
	const [isPublishing, setIsPublishing] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Helper to update active field
	const updateField = (id: string, updates: Partial<TextField>) => {
		setFields((prev) =>
			prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
		);
	};

	const addField = () => {
		const newField: TextField = {
			id: uuidv4(),
			label: "New Field",
			text: "New Text",
			x: 0,
			y: 0,
			font: "Bickham Script Pro Regular",
			fontSize: 100,
			fontWeight: "300",
			color: "#000000",
			anchorMode: "center",
			required: false, // Default to false for extra fields
		};
		setFields((prev) => [...prev, newField]);
		setSelectedFieldId(newField.id);
	};

	const removeField = (id: string) => {
		if (fields.length <= 1) {
			toast.error("Cannot remove the last field");
			return;
		}
		setFields((prev) => prev.filter((f) => f.id !== id));
		if (selectedFieldId === id) {
			setSelectedFieldId(fields[0].id);
		}
	};

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

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleTemplateUpload(file);
		}
	};

	useEffect(() => {
		return () => {
			if (templateUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(templateUrl);
			}
		};
	}, [templateUrl]);

	const handlePositionChange = (axis: "x" | "y", direction: number) => {
		updateField(selectedFieldId, {
			[axis]: activeField[axis] + direction,
		});
	};

	const handleManualPositionChange = (axis: "x" | "y", value: number) => {
		updateField(selectedFieldId, {
			[axis]: value,
		});
	};

	const handleDownload = async () => {
		if (!templateFile) {
			toast.error("Please upload a template first");
			return;
		}

		const formData = new FormData();
		formData.append("template", templateFile);
		formData.append("recipients", JSON.stringify(recipients));
		formData.append("fields", JSON.stringify(fields));
		formData.append("inEditor", "true");

		try {
			const response = await axios.post(
				`${BASE_URL}/generate/`,
				formData,
				{ responseType: "blob" },
			);

			const url = URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Certificate.png`;
			link.click();
			URL.revokeObjectURL(url);

			logEvent("Certificate", "Generate", "Editor Generation");

			toast.success("Download Complete.");
		} catch (error) {
			toast.error("Failed to generate certificates");
		}
	};

	const handleShareClick = () => {
		if (!templateFile) {
			toast.error("Please upload a template first");
			return;
		}
		setShowIdDialog(true);
	};

	const checkId = async (publicId: string) => {
		const res = await axios.post(`${BASE_URL}/check_public_id/`, {
			public_id: publicId,
		});

		return res.data.exists;
	};

	const handlePublish = async () => {
		if (!templateFile || isPublishing) return;

		setIsPublishing(true);
		const toastId = toast.loading("Uploading and saving configuration...");

		try {
			let finalPublicId = customPublicId.trim();

			if (finalPublicId) {
				const exists = await checkId(finalPublicId);
				if (exists) {
					const randomSuffix = Date.now().toString();
					finalPublicId = `${finalPublicId}_${randomSuffix}`;
					setCustomPublicId(finalPublicId);
					toast.info(`ID exists. Using ${finalPublicId} instead.`);
				}
			}

			const formData = new FormData();
			formData.append("template", templateFile);
			if (finalPublicId) {
				formData.append("public_id", finalPublicId);
			}

			// Encode fields as JSON string? Or send individually?
			// Ideally we save this to a database.
			// Currently the endpoint expects flat params for 1 field.
			// But we'll try to just rely on URL params for now as a quick hack unless we update the DB.

			// For multi-field, we can't easily put it all in URL params without bloat.
			// Let's assume we send "fields" as a JSON string and the backend could save it if we uncommented the DB code.
			// But for "Sharing URL", we have to pack it.

			const fieldsJson = JSON.stringify(fields);
			const encodedFields = btoa(fieldsJson); // Simple Base64 encoding

			const res = await axios.post(`${BASE_URL}/upload/`, formData);

			if (res.data.public_id) {
				const newId = res.data.public_id;

				// New URL structure: ?id=...&data=...
				const params = new URLSearchParams({
					id: newId,
					data: encodedFields,
				});
				const link = `${window.location.origin}/participant?${params.toString()}`;
				setGeneratedLink(link);
				setShowIdDialog(false);
				setShowShareDialog(true);

				logEvent("Certificate", "Publish", "New Template Published");

				toast.dismiss(toastId);
				toast.success("Published successfully!");
			}
		} catch (error) {
			console.error(error);
			toast.dismiss(toastId);
			toast.error("Failed to publish.");
		} finally {
			setIsPublishing(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<Header
				onTourClick={() => {
					resetTour();
					startTour();
				}}
				onCreateClick={() => fileInputRef.current?.click()}
			/>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileSelect}
			/>

			{/* Main Content */}
			<main className="flex-1 overflow-hidden">
				<Tabs defaultValue="editor" className="h-full flex flex-col">
					<div className="border-b border-border flex-shrink-0">
						<div className="container mx-auto px-6">
							<TabsList
								className="bg-transparent h-12 p-0"
								data-tour="tabs"
							>
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
								<div
									className="h-full max-w-[264px]"
									data-tour="position-controls"
								>
									<PositionControls
										onPositionChange={handlePositionChange}
										textPosition={{
											x: activeField.x,
											y: activeField.y,
										}}
										onManualPositionChange={
											handleManualPositionChange
										}
										anchorMode={activeField.anchorMode}
										onAnchorModeChange={(mode) =>
											updateField(activeField.id, {
												anchorMode: mode,
											})
										}
									/>
								</div>

								{/* Center Preview */}
								<div
									className="flex items-center justify-center"
									data-tour="certificate-preview"
								>
									<CertificatePreview
										templateUrl={templateUrl}
										showPreview={showPreview}
										imgRef={imgRef}
										previewRef={previewRef}
										fields={fields}
										selectedFieldId={selectedFieldId}
										onFieldSelect={setSelectedFieldId}
									/>
								</div>

								{/* Right Controls */}
								<div
									className="h-full max-w-[264px] px-2 flex flex-col gap-2"
									data-tour="control-panel"
								>
									<Button
										variant="outline"
										size="sm"
										className="w-full mb-2 border-dashed text-muted-foreground hover:text-primary"
										onClick={() =>
											navigate("/advanced", {
												state: {
													fields,
													templateUrl,
													// sending file might struggle if it's large but let's try, or just URL
													templateFile,
												},
											})
										}
									>
										Switch to Multi-Field (Advanced)
									</Button>

									<ControlPanel
										fields={fields}
										selectedFieldId={selectedFieldId}
										onFieldUpdate={updateField}
										onAddField={addField}
										onRemoveField={removeField}
										onFieldSelect={setSelectedFieldId}
										onTemplateUpload={handleTemplateUpload}
										onGenerate={handleDownload}
										onShare={handleShareClick}
										hasTemplate={!!templateUrl}
										simpleView={true}
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

			<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Certificate Published!</DialogTitle>
						<DialogDescription>
							Share this link with your participants to let them
							fill their details.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2">
						<div className="grid flex-1 gap-2">
							<Label htmlFor="link" className="sr-only">
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
								navigator.clipboard.writeText(generatedLink);
								toast.success("Copied to clipboard");
							}}
						>
							<span className="sr-only">Copy</span>
							Copy
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showIdDialog} onOpenChange={setShowIdDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set a Public ID</DialogTitle>
						<DialogDescription>
							Enter a custom ID for your template or leave blank
							for a random one.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="public-id" className="">
								Public ID Here:
							</Label>
							<Input
								id="public-id"
								value={customPublicId}
								onChange={(e) =>
									setCustomPublicId(e.target.value)
								}
								className="col-span-3"
								placeholder="e.g. hackathon-2024"
							/>
						</div>
					</div>
					<div className="flex w-full">
						<Button
							className="w-full"
							onClick={handlePublish}
							disabled={isPublishing}
						>
							{isPublishing ? "Publishing..." : "Publish"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Index;
