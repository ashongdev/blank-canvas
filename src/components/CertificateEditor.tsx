import CertificatePreview from "@/components/CertificatePreview";
import ControlPanel from "@/components/ControlPanel";
import EditorAuthFooter from "@/components/EditorAuthFooter";
import Header from "@/components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import RecipientManager from "@/components/RecipientManager";
import useFunctions from "@/hooks/useFunctions";
import useTemplateManager from "@/hooks/useTemplateManager";
import { useTour } from "@/hooks/useTour";
import { createDefaultTextField } from "@/lib/defaultField";
import { copyLinkToClipboard, restartTour } from "@/lib/editorUtils";
import { cn } from "@/lib/utils";
import type { Recipient, TextField } from "@/types/TextField";
import type { DriveStep } from "driver.js";
import {
	Download,
	FlaskConical,
	Loader2,
	Plus,
	Share2,
	Upload,
	Users,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CertificateEditorProps {
	mode: "simple" | "advanced";
	tourSteps: DriveStep[];
	tourStorageKey: string;
	initialFields?: TextField[];
	initialTemplateFile?: File | null;
	initialTemplateUrl?: string | null;
	initialRecipients?: Recipient[];
	templateUseMode?: "testing" | "actual";
}

const CertificateEditor = ({
	mode,
	tourSteps,
	tourStorageKey,
	initialFields,
	initialTemplateFile = null,
	initialTemplateUrl = null,
	initialRecipients = [],
	templateUseMode,
}: CertificateEditorProps) => {
	const navigate = useNavigate();
	const { startTour, resetTour } = useTour({
		steps: tourSteps,
		storageKey: tourStorageKey,
		autoStart: true,
	});

	const [templateFile, setTemplateFile] = useState<File | null>(initialTemplateFile);
	const [templateUrl, setTemplateUrl] = useState<string | null>(initialTemplateUrl);
	const [showPreview] = useState(true);
	const [fields, setFields] = useState<TextField[]>(
		initialFields ?? [createDefaultTextField()],
	);
	const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0].id);
	const activeField = fields.find((f) => f.id === selectedFieldId) ?? fields[0];
	const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
	const [showRecipients, setShowRecipients] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const previewRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [showShareDialog, setShowShareDialog] = useState(false);
	const [generatedLink, setGeneratedLink] = useState("");
	const [showIdDialog, setShowIdDialog] = useState(false);
	const [customPublicId, setCustomPublicId] = useState("");
	const [isPublishing, setIsPublishing] = useState(false);

	const { addField, removeField, updateField } = useFunctions({
		fields,
		selectedFieldId,
		activeField,
		setFields,
		setSelectedFieldId,
	});

	const {
		handleDownload,
		handleFileSelect,
		handleShareClick,
		handlePublish,
		handleTemplateUpload,
		handleBatchDownload,
	} = useTemplateManager({
		templateFile,
		templateUrl,
		fields,
		recipients,
		customPublicId,
		isPublishing,
		setTemplateFile,
		setTemplateUrl,
		setCustomPublicId,
		setIsPublishing,
		setShowIdDialog,
		setShowShareDialog,
		setGeneratedLink,
	});

	const isSimple = mode === "simple";
	const hasTemplate = !!templateUrl;

	const handleGenerateClick = async () => {
		if (isGenerating) return;
		setIsGenerating(true);
		try {
			await Promise.resolve(handleDownload());
		} finally {
			setIsGenerating(false);
		}
	};

	// Arrow-key nudging for the selected field, direct on the canvas.
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (showRecipients || showShareDialog || showIdDialog) return;
			const tag = (document.activeElement?.tagName || "").toLowerCase();
			if (["input", "textarea", "select"].includes(tag)) return;
			if (!activeField) return;

			const step = e.shiftKey ? 10 : 1;
			switch (e.key) {
				case "ArrowUp":
					e.preventDefault();
					updateField(activeField.id, { y: activeField.y - step });
					break;
				case "ArrowDown":
					e.preventDefault();
					updateField(activeField.id, { y: activeField.y + step });
					break;
				case "ArrowLeft":
					e.preventDefault();
					updateField(activeField.id, { x: activeField.x - step });
					break;
				case "ArrowRight":
					e.preventDefault();
					updateField(activeField.id, { x: activeField.x + step });
					break;
				default:
					return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeField, showRecipients, showShareDialog, showIdDialog, updateField]);

	return (
		<div className="min-h-screen bg-background flex flex-col overflow-hidden">
			<Header
				onTourClick={() => restartTour(resetTour, startTour)}
				onCreateClick={() => fileInputRef.current?.click()}
			/>

			{isSimple && templateUseMode === "testing" && (
				<Alert className="rounded-none border-x-0 border-t-0 bg-muted/50">
					<FlaskConical className="h-4 w-4" />
					<AlertDescription>
						You&apos;re using a marketplace template in{" "}
						<strong>testing mode</strong> with sample data. Switch to
						Recipients to see sample entries, or edit fields for your
						real certificate.
					</AlertDescription>
				</Alert>
			)}

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileSelect}
			/>

			{/* Toolbar — every whole-certificate action lives here, always visible */}
			<div
				className="border-b border-border flex-shrink-0 flex items-center gap-2 px-4 sm:px-6 h-14 overflow-x-auto"
				data-tour="tabs"
			>
				<Button
					variant="outline"
					size="sm"
					className="gap-2 shrink-0"
					onClick={() => fileInputRef.current?.click()}
				>
					<Upload className="h-4 w-4" />
					{hasTemplate ? "Change Template" : "Upload Template"}
				</Button>

				<div className="h-5 w-px bg-border shrink-0" aria-hidden />

				{isSimple ? (
					<Button
						variant="ghost"
						size="sm"
						className="shrink-0 text-muted-foreground hover:text-primary"
						onClick={() =>
							navigate("/advanced", {
								state: { fields, templateUrl, templateFile },
							})
						}
					>
						Switch to Advanced
					</Button>
				) : (
					<Button
						variant="ghost"
						size="sm"
						className="shrink-0 text-muted-foreground hover:text-primary"
						onClick={() =>
							navigate("/", {
								state: {
									fields: [fields[0]],
									templateUrl,
									templateFile,
								},
							})
						}
					>
						&larr; Simple Editor
					</Button>
				)}

				<div className="ml-auto flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="sm"
						className="gap-2"
						onClick={() => setShowRecipients(true)}
					>
						<Users className="h-4 w-4" />
						Recipients
						{recipients.length > 0 && (
							<span className="ml-0.5 rounded-full bg-primary/15 px-1.5 text-xs font-medium text-primary">
								{recipients.length}
							</span>
						)}
					</Button>

					<Button
						size="sm"
						className="gap-2"
						disabled={!hasTemplate || isGenerating}
						onClick={handleGenerateClick}
					>
						{isGenerating ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Download className="h-4 w-4" />
						)}
						Generate
					</Button>

					<Button
						variant="secondary"
						size="sm"
						className="gap-2"
						disabled={!hasTemplate}
						onClick={handleShareClick}
						data-tour="share-button"
					>
						<Share2 className="h-4 w-4" />
						Share
					</Button>
				</div>
			</div>

			<main className="flex-1 overflow-hidden flex">
				<div className="flex-1 flex flex-col overflow-hidden">
					{!isSimple && (
						<div
							className="border-b border-border flex-shrink-0 flex items-center gap-2 px-4 sm:px-6 h-12 overflow-x-auto"
							data-tour="fields-list"
						>
							{fields.map((field) => (
								<button
									key={field.id}
									onClick={() => setSelectedFieldId(field.id)}
									className={cn(
										"group shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
										field.id === selectedFieldId
											? "border-primary bg-primary/10 text-primary"
											: "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
									)}
								>
									{field.label}
									{fields.length > 1 && (
										<X
											className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
											onClick={(e) => {
												e.stopPropagation();
												removeField(field.id);
											}}
										/>
									)}
								</button>
							))}
							<button
								onClick={addField}
								data-tour="add-field-btn"
								className="shrink-0 flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
							>
								<Plus className="h-3 w-3" />
								Add Field
							</button>
						</div>
					)}

					<div
						className="flex-1 flex items-center justify-center overflow-auto p-6"
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
							onFieldMove={(id, x, y) => updateField(id, { x, y })}
						/>
					</div>

					{hasTemplate && (
						<p className="text-center text-xs text-muted-foreground pb-3 shrink-0">
							Drag the text to reposition · arrow keys to nudge
							(hold Shift for bigger steps)
						</p>
					)}
				</div>

				<div
					className="w-[300px] border-l border-border flex-shrink-0 px-2 pt-4"
					data-tour="control-panel"
				>
					<ControlPanel
						fields={fields}
						selectedFieldId={selectedFieldId}
						onFieldUpdate={updateField}
						simpleView={isSimple}
					/>
				</div>
			</main>

			<Sheet open={showRecipients} onOpenChange={setShowRecipients}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-md flex flex-col gap-0 p-0"
				>
					<SheetHeader className="p-6 pb-2">
						<SheetTitle>Recipients</SheetTitle>
						<SheetDescription>
							Add the people who&apos;ll receive this certificate,
							then generate them all at once.
						</SheetDescription>
					</SheetHeader>
					<div className="flex-1 overflow-auto px-6 pb-6">
						<RecipientManager
							recipients={recipients}
							onRecipientsChange={setRecipients}
							onGenerateAll={handleBatchDownload}
						/>
					</div>
				</SheetContent>
			</Sheet>

			<Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Certificate Published!</DialogTitle>
						<DialogDescription>
							Share this link with your participants to let them fill
							their details.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2">
						<div className="grid flex-1 gap-2">
							<Label htmlFor="link" className="sr-only">
								Link
							</Label>
							<Input id="link" defaultValue={generatedLink} readOnly />
						</div>
						<Button
							size="sm"
							className="px-3"
							onClick={() => void copyLinkToClipboard(generatedLink)}
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
							Enter a custom ID for your template or leave blank for a
							random one.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="public-id">Public ID Here:</Label>
							<Input
								id="public-id"
								value={customPublicId}
								onChange={(e) => setCustomPublicId(e.target.value)}
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

			{isSimple && <EditorAuthFooter />}
		</div>
	);
};

export default CertificateEditor;
