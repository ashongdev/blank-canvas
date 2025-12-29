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
import { motion } from "framer-motion";
import { Loader2, Upload } from "lucide-react";
import React, { useState } from "react";

interface ControlPanelProps {
	showPreview: boolean;
	onPreviewToggle: (checked: boolean) => void;
	selectedFont: string;
	onFontChange: (font: string) => void;
	fontSize: number;
	onFontSizeChange: (size: number) => void;
	fontWeight: string;
	onFontWeightChange: (weight: string) => void;
	textColor: string;
	onTextColorChange: (color: string) => void;
	onTemplateUpload: (file: File) => void;
	onGenerate: () => Promise<void> | void;
	onGenerateAndMail: () => Promise<void> | void;
	hasTemplate: boolean;
}

const CERTIFICATE_FONTS = [
	{
		value: "Bickham Script Pro Regular",
		label: "Bickham Script Pro Regular",
	},
	{ value: "Great Vibes", label: "Great Vibes" },
	{ value: "Alex Brush", label: "Alex Brush" },
	{ value: "Snell Roundhand", label: "Snell Roundhand" },
	{ value: "Kunstler Script", label: "Kunstler Script" },
	{ value: "Garamond", label: "Garamond" },
	{ value: "Times New Roman", label: "Times New Roman" },
	{ value: "Cinzel", label: "Cinzel" },
	{ value: "Georgia", label: "Georgia" },
	{ value: "Libre Baskerville", label: "Libre Baskerville" },
	{ value: "Marcellus", label: "Marcellus" },
	{ value: "Playfair Display", label: "Playfair Display" },
	{ value: "Cormorant Garamond", label: "Cormorant Garamond" },
	{ value: "Crimson Text", label: "Crimson Text" },
	{ value: "Montserrat", label: "Montserrat" },
	{ value: "Raleway", label: "Raleway" },
	{ value: "Lato", label: "Lato" },
	{ value: "Open Sans", label: "Open Sans" },
	{ value: "Inter", label: "Inter" },
];

const FONT_WEIGHTS = [
	{ value: "300", label: "Light" },
	{ value: "400", label: "Regular" },
	{ value: "500", label: "Medium" },
	{ value: "600", label: "Semi Bold" },
	{ value: "700", label: "Bold" },
	{ value: "800", label: "Extra Bold" },
];

const PREDEFINED_COLORS = [
	{ value: "#000000", label: "Black" },
	{ value: "#FFFFFF", label: "White" },
	{ value: "#FF0000", label: "Red" },
	{ value: "#00FF00", label: "Green" },
	{ value: "#0000FF", label: "Blue" },
	{ value: "#FFFF00", label: "Yellow" },
	{ value: "#FF00FF", label: "Magenta" },
	{ value: "#00FFFF", label: "Cyan" },
	{ value: "#FFA500", label: "Orange" },
	{ value: "#800080", label: "Purple" },
	{ value: "#FFD700", label: "Gold" },
	{ value: "#C0C0C0", label: "Silver" },
];

const ControlPanel = ({
	showPreview,
	onPreviewToggle,
	selectedFont,
	onFontChange,
	fontSize,
	onFontSizeChange,
	fontWeight,
	onFontWeightChange,
	textColor,
	onTextColorChange,
	onTemplateUpload,
	onGenerate,
	onGenerateAndMail,
	hasTemplate,
}: ControlPanelProps) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isGeneratingAndMail, setIsGeneratingAndMail] = useState(false);
	const isLoading = isGenerating || isGeneratingAndMail;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onTemplateUpload(file);
		}
	};

	const handleGenerate = async () => {
		if (isLoading) return;
		setIsGenerating(true);
		try {
			await Promise.resolve(onGenerate());
		} finally {
			setIsGenerating(false);
		}
	};

	const handleGenerateAndMail = async () => {
		if (isLoading) return;
		setIsGeneratingAndMail(true);
		try {
			await Promise.resolve(onGenerateAndMail());
		} finally {
			setIsGeneratingAndMail(false);
		}
	};

	return (
		<ScrollArea className="h-[70vh] pr-3 overflow-x-hidden">
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col space-y-8 pl-4"
			>
				{/* Upload Section */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Template</h3>
					<label htmlFor="template-upload">
						<input
							id="template-upload"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="hidden"
						/>
						<Button
							variant="outline"
							className="w-full justify-start gap-2 hover:border-primary transition-smooth"
							asChild
						>
							<span>
								<Upload className="w-4 h-4" />
								Upload
							</span>
						</Button>
					</label>
				</div>

				{/* Preview Toggle */}
				{/* <div className="space-y-3">
					<h3 className="text-sm font-medium">Preview</h3>
					<div className="flex items-center justify-between p-3 rounded-lg border border-border">
						<Label
							htmlFor="preview-toggle"
							className="text-sm cursor-pointer flex items-center gap-2"
						>
							{showPreview ? (
								<Eye className="w-4 h-4 text-primary" />
							) : (
								<EyeOff className="w-4 h-4 text-muted-foreground" />
							)}
							<span>{showPreview ? "Visible" : "Hidden"}</span>
						</Label>
						<Switch
							id="preview-toggle"
							checked={showPreview}
							onCheckedChange={onPreviewToggle}
						/>
					</div>
				</div> */}

				{/* Font Selection */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Font Family</h3>
					<Select value={selectedFont} onValueChange={onFontChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select font" />
						</SelectTrigger>
						<SelectContent>
							{CERTIFICATE_FONTS.map((font) => (
								<SelectItem key={font.value} value={font.value}>
									<span style={{ fontFamily: font.value }}>
										{font.label}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Font Size */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Font Size</h3>
					<Input
						type="number"
						value={fontSize}
						onChange={(e) =>
							onFontSizeChange(Number(e.target.value))
						}
						min={12}
						max={200}
						className="w-full"
					/>
				</div>

				{/* Font Weight */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Font Weight</h3>
					<Select
						value={fontWeight}
						onValueChange={onFontWeightChange}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select weight" />
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

				{/* Text Color */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Text Color</h3>
					<div className="space-y-2">
						{/* Custom Color Input */}
						<Input
							type="text"
							value={textColor}
							onChange={(e) => onTextColorChange(e.target.value)}
							placeholder="#000000 or rgb(0,0,0)"
							className="w-full font-mono text-sm"
							maxLength={30}
						/>

						{/* Predefined Colors */}
						<div className="grid grid-cols-4 gap-2">
							{PREDEFINED_COLORS.map((color) => (
								<button
									key={color.value}
									onClick={() =>
										onTextColorChange(color.value)
									}
									className="h-10 rounded border-2 transition-smooth hover:scale-105"
									style={{
										backgroundColor: color.value,
										borderColor:
											textColor === color.value
												? "hsl(var(--primary))"
												: "hsl(var(--border))",
									}}
									title={color.label}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3 pt-4 border-t border-border">
					<Button
						onClick={handleGenerate}
						disabled={!hasTemplate || isLoading}
						className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-smooth"
					>
						{isGenerating && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin inline-block" />
						)}
						Generate
					</Button>
					<Button
						onClick={handleGenerateAndMail}
						disabled={!hasTemplate || isLoading}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
					>
						{isGeneratingAndMail && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin inline-block" />
						)}
						Generate & Mail
					</Button>
				</div>
			</motion.div>
		</ScrollArea>
	);
};

export default ControlPanel;
