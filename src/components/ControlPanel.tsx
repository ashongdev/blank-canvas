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
import { Move, Settings2, Type } from "lucide-react";

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
	simpleView?: boolean;
}

const ControlPanel = ({
	fields,
	selectedFieldId,
	onFieldUpdate,
	simpleView = false,
}: ControlPanelProps) => {
	const activeField =
		fields.find((f) => f.id === selectedFieldId) || fields[0];

	// Identify if the active field is the primary (first) field
	const isPrimaryField =
		fields.length > 0 && activeField?.id === fields[0].id;

	if (!activeField) return null;

	return (
		<ScrollArea className="h-full pr-3 overflow-x-hidden">
			<motion.div
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col space-y-6 pl-4 pb-10"
			>
				{/* Field Settings */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium flex items-center gap-2">
						<Settings2 className="w-4 h-4" />
						{simpleView ? "Text Settings" : "Selected Field"}
					</h3>

					<div className="grid grid-cols-1 gap-3">
						{!simpleView && (
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
						)}
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
				</div>

				<Separator />

				{/* Position */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium flex items-center gap-2">
						<Move className="w-4 h-4" />
						Position
					</h3>
					<p className="text-xs text-muted-foreground -mt-2">
						Drag the text on the canvas, or fine-tune here.
					</p>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<label className="text-xs text-muted-foreground">
								X
							</label>
							<Input
								type="number"
								value={activeField.x}
								onChange={(e) =>
									onFieldUpdate(activeField.id, {
										x: Number(e.target.value),
									})
								}
								className="h-8"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-xs text-muted-foreground">
								Y
							</label>
							<Input
								type="number"
								value={activeField.y}
								onChange={(e) =>
									onFieldUpdate(activeField.id, {
										y: Number(e.target.value),
									})
								}
								className="h-8"
							/>
						</div>
					</div>
					<div className="flex items-center justify-between border rounded-md p-2">
						<div>
							<p className="text-xs font-medium">Text Anchor</p>
							<p className="text-xs text-muted-foreground">
								{activeField.anchorMode === "center"
									? "Center"
									: "Top-Left"}
							</p>
						</div>
						<Switch
							checked={activeField.anchorMode === "left"}
							onCheckedChange={(checked) =>
								onFieldUpdate(activeField.id, {
									anchorMode: checked ? "left" : "center",
								})
							}
						/>
					</div>
				</div>

				<Separator />

				{/* Font Family */}
				<div className="space-y-2">
					<h3 className="text-sm font-medium flex items-center gap-2">
						<Type className="w-4 h-4" />
						Typography
					</h3>
					<label className="text-xs text-muted-foreground">
						Font Family
					</label>
					<Select
						value={activeField.font}
						onValueChange={(val) =>
							onFieldUpdate(activeField.id, { font: val })
						}
					>
						<SelectTrigger className="w-full h-8">
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
									fontSize: Number(e.target.value),
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
									style={{ backgroundColor: color }}
									onClick={() =>
										onFieldUpdate(activeField.id, {
											color: color,
										})
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
			</motion.div>
		</ScrollArea>
	);
};

export default ControlPanel;
