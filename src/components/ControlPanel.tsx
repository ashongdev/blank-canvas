import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CERTIFICATE_FONTS, FONT_WEIGHTS } from "@/lib/utils";
import { TextField } from "@/types/TextField";
import { motion } from "framer-motion";
import {
	Loader2,
	Plus,
	Settings2,
	Share2,
	Trash2,
	Type,
	Upload,
} from "lucide-react";
import { useState } from "react";

const PREDEFINED_COLORS = [
	"#000000", // Black
	"#FFFFFF", // White
	"#1E293B", // Slope Slate
	"#EF4444", // Red
	"#22C55E", // Green
	"#3B82F6", // Blue
	"#F59E0B", // Amber
	"#8B5CF6", // Violet
];

interface ControlPanelProps {
	fields: TextField[];
	selectedFieldId: string;
	onFieldUpdate: (id: string, updates: Partial<TextField>) => void;
	onAddField: () => void;
	onRemoveField: (id: string) => void;
	onFieldSelect: (id: string) => void;
	onTemplateUpload: (file: File) => void;
	onGenerate: () => Promise<void> | void;
	onShare?: () => Promise<void> | void;
	hasTemplate: boolean;
	simpleView?: boolean;
}

const ControlPanel = ({
	fields,
	selectedFieldId,
	onFieldUpdate,
	onAddField,
	onRemoveField,
	onFieldSelect,
	onTemplateUpload,
	onGenerate,
	onShare,
	hasTemplate,
	simpleView = false,
}: ControlPanelProps) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const activeField =
		fields.find((f) => f.id === selectedFieldId) || fields[0];

	// Identify if the active field is the primary (first) field
	const isPrimaryField =
		fields.length > 0 && activeField?.id === fields[0].id;

	const handleDownload = async () => {
		if (isGenerating) return;
		setIsGenerating(true);
		try {
			await Promise.resolve(onGenerate());
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<ScrollArea className="h-[calc(100vh-120px)] pr-3 overflow-x-hidden">
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col space-y-6 pl-4 pb-10"
			>
				{/* Template Upload */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium flex items-center gap-2">
						<Upload className="w-4 h-4" />
						Template
					</h3>
					<div className="grid w-full max-w-sm items-center gap-1.5 relative">
						<Button
							variant="outline"
							className="w-full relative z-10 pointer-events-none justify-start px-3 text-muted-foreground font-normal"
						>
							<Upload className="w-4 h-4 mr-2" />
							{hasTemplate
								? "Change Template"
								: "Upload Template"}
						</Button>
						<Input
							id="picture"
							type="file"
							accept="image/*"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) onTemplateUpload(file);
							}}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
						/>
					</div>
				</div>

				<Separator />

				{/* Field Management */}
				{!simpleView && (
					<>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3
									className="text-sm font-medium flex items-center gap-2"
									data-tour="fields-list"
								>
									<Type className="w-4 h-4" />
									Fields
								</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={onAddField}
									className="h-8"
									data-tour="add-field-btn"
								>
									<Plus className="w-3 h-3 mr-1" />
									Add
								</Button>
							</div>

							<div className="flex flex-col gap-2">
								{fields.map((field) => (
									<div
										key={field.id}
										className={`flex items-center gap-2 p-2 rounded-md border transition-colors cursor-pointer ${
											selectedFieldId === field.id
												? "bg-accent border-primary"
												: "bg-card border-border hover:bg-muted"
										}`}
										onClick={() => onFieldSelect(field.id)}
									>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium truncate">
												{field.label}
											</p>
											<p className="text-[10px] text-muted-foreground truncate">
												{field.text}
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-muted-foreground hover:text-destructive"
											onClick={(e) => {
												e.stopPropagation();
												onRemoveField(field.id);
											}}
										>
											<Trash2 className="w-3 h-3" />
										</Button>
									</div>
								))}
							</div>
						</div>

						<Separator />
					</>
				)}

				{activeField && (
					<>
						{/* Field Settings */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium flex items-center gap-2">
								<Settings2 className="w-4 h-4" />
								{simpleView
									? "Text Settings"
									: "Selected Field Settings"}
							</h3>

							{/* Label & Value */}
							<div className="grid grid-cols-1 gap-3">
								<div className="space-y-2">
									<label className="text-xs text-muted-foreground">
										Label (Internal)
									</label>
									<Input
										value={activeField.label}
										onChange={(e) =>
											onFieldUpdate(activeField.id, {
												label: e.target.value,
											})
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-xs text-muted-foreground">
										Preview Text
									</label>
									<Input
										value={activeField.text}
										onChange={(e) =>
											onFieldUpdate(activeField.id, {
												text: e.target.value,
											})
										}
										className="h-8"
									/>
								</div>
								{!simpleView && (
									<div
										className="flex items-center justify-between border rounded-md p-2"
										data-tour="required-toggle"
									>
										<label
											className={`text-xs ${
												isPrimaryField
													? "text-muted-foreground/50"
													: "text-muted-foreground"
											}`}
										>
											Required for Participant
										</label>
										<Switch
											checked={
												isPrimaryField ||
												(activeField.required ?? false)
											}
											disabled={isPrimaryField}
											onCheckedChange={(checked) =>
												onFieldUpdate(activeField.id, {
													required: checked,
												})
											}
										/>
									</div>
								)}
							</div>

							{/* Font Family */}
							<div className="space-y-2">
								<label className="text-xs text-muted-foreground">
									Font Family
								</label>
								<Select
									value={activeField.font}
									onValueChange={(val) =>
										onFieldUpdate(activeField.id, {
											font: val,
										})
									}
								>
									<SelectTrigger className="w-full h-8">
										<SelectValue placeholder="Select font" />
									</SelectTrigger>
									<SelectContent>
										{CERTIFICATE_FONTS.map((font) => (
											<SelectItem
												key={font.value}
												value={font.value}
											>
												<span
													style={{
														fontFamily: font.value,
													}}
												>
													{font.label}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								{/* Font Size */}
								<div className="space-y-2">
									<label className="text-xs text-muted-foreground">
										Size (px)
									</label>
									<Input
										type="number"
										value={activeField.fontSize}
										onChange={(e) =>
											onFieldUpdate(activeField.id, {
												fontSize: Number(
													e.target.value,
												),
											})
										}
										min={8}
										max={300}
										className="h-8"
									/>
								</div>

								{/* Font Weight */}
								<div className="space-y-2">
									<label className="text-xs text-muted-foreground">
										Weight
									</label>
									<Select
										value={activeField.fontWeight}
										onValueChange={(val) =>
											onFieldUpdate(activeField.id, {
												fontWeight: val,
											})
										}
									>
										<SelectTrigger className="w-full h-8">
											<SelectValue placeholder="Weight" />
										</SelectTrigger>
										<SelectContent>
											{FONT_WEIGHTS.map((weight) => (
												<SelectItem
													key={weight.value}
													value={weight.value}
												>
													{weight.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Color */}
							<div className="space-y-2">
								<label className="text-xs text-muted-foreground">
									Color
								</label>
								<div className="flex flex-col gap-2">
									<div className="flex flex-wrap gap-1.5">
										{PREDEFINED_COLORS.map((color) => (
											<button
												key={color}
												className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 active:scale-95 ${
													activeField.color === color
														? "ring-2 ring-primary ring-offset-2"
														: ""
												}`}
												style={{
													backgroundColor: color,
												}}
												onClick={() =>
													onFieldUpdate(
														activeField.id,
														{
															color: color,
														},
													)
												}
											/>
										))}
									</div>
									<div className="flex gap-2">
										<Input
											type="color"
											value={activeField.color}
											onChange={(e) =>
												onFieldUpdate(activeField.id, {
													color: e.target.value,
												})
											}
											className="w-10 h-8 p-0 border-0 cursor-pointer"
										/>
										<Input
											type="text"
											value={activeField.color}
											onChange={(e) =>
												onFieldUpdate(activeField.id, {
													color: e.target.value,
												})
											}
											className="flex-1 h-8 font-mono uppercase"
										/>
									</div>
								</div>
							</div>
						</div>

						<Separator />
					</>
				)}

				{/* Actions */}
				<div className="space-y-3 pt-2">
					<Button
						onClick={handleDownload}
						disabled={!hasTemplate || isGenerating}
						className="w-full"
					>
						{isGenerating ? (
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<Upload className="w-4 h-4 mr-2" />
						)}
						Generate Sample
					</Button>

					{onShare && (
						<Button
							onClick={onShare}
							disabled={!hasTemplate}
							variant="secondary"
							className="w-full"
						>
							<Share2 className="w-4 h-4 mr-2" />
							Publish & Share
						</Button>
					)}
				</div>
			</motion.div>
		</ScrollArea>
	);
};

export default ControlPanel;
