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
import {
	CERTIFICATE_FONTS,
	FONT_WEIGHTS,
	PREDEFINED_COLORS,
} from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, Share2, Upload } from "lucide-react";
import React, { useState } from "react";

interface ControlPanelProps {
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
	onShare?: () => Promise<void> | void;
	hasTemplate: boolean;
}

const ControlPanel = ({
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
	onShare,
	hasTemplate,
}: ControlPanelProps) => {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onTemplateUpload(file);
		}
	};

	const handleGenerate = async () => {
		if (isGenerating) return;
		setIsGenerating(true);
		try {
			await Promise.resolve(onGenerate());
		} finally {
			setIsGenerating(false);
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
					{onShare && (
						<Button
							onClick={onShare}
							disabled={!hasTemplate}
							variant="secondary"
							className="w-full gap-2 transition-smooth"
						>
							<Share2 className="w-4 h-4" />
							Share Template
						</Button>
					)}
					<Button
						onClick={handleGenerate}
						disabled={!hasTemplate || isGenerating}
						className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-smooth"
					>
						{isGenerating && (
							<Loader2 className="w-4 h-4 mr-2 animate-spin inline-block" />
						)}
						Generate
					</Button>
				</div>
			</motion.div>
		</ScrollArea>
	);
};

export default ControlPanel;
