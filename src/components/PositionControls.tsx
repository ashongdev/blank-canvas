import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
} from "lucide-react";

interface PositionControlsProps {
	onPositionChange: (axis: "x" | "y", direction: number) => void;
	textPosition: { x: number; y: number };
	onManualPositionChange: (axis: "x" | "y", value: number) => void;
	anchorMode: "center" | "left";
	onAnchorModeChange: (mode: "center" | "left") => void;
}

const PositionControls = ({
	onPositionChange,
	textPosition,
	onManualPositionChange,
	anchorMode,
	onAnchorModeChange,
}: PositionControlsProps) => {
	const controlButton = (
		icon: React.ReactNode,
		onClick: () => void,
		label: string,
	) => (
		<Button
			variant="outline"
			size="icon"
			onClick={onClick}
			className="w-10 h-10 rounded-full border-border hover:border-primary hover:text-primary transition-smooth shadow-soft"
			aria-label={label}
		>
			{icon}
		</Button>
	);

	return (
		<ScrollArea className="h-full">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col items-center space-y-8 pr-4"
			>
				<div className="flex flex-col items-center space-y-2">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Vertical
					</span>
					<div className="flex flex-col space-y-2">
						{controlButton(
							<ChevronUp className="w-4 h-4" />,
							() => onPositionChange("y", -5),
							"Move up",
						)}
						{controlButton(
							<ChevronDown className="w-4 h-4" />,
							() => onPositionChange("y", 5),
							"Move down",
						)}
					</div>
				</div>

				<div className="flex flex-col items-center space-y-2">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Horizontal
					</span>
					<div className="flex space-x-2">
						{controlButton(
							<ChevronLeft className="w-4 h-4" />,
							() => onPositionChange("x", -5),
							"Move left",
						)}
						{controlButton(
							<ChevronRight className="w-4 h-4" />,
							() => onPositionChange("x", 5),
							"Move right",
						)}
					</div>
				</div>

				<div className="flex items-center justify-center gap-3">
					<div className="w-full max-w-[80px] relative">
						<Label
							htmlFor="x-input"
							className="text-xs text-muted-foreground absolute top-2 left-2"
						>
							X
						</Label>
						<Input
							id="x-input"
							type="number"
							value={textPosition.x}
							onChange={(e) =>
								onManualPositionChange(
									"x",
									Number(e.target.value),
								)
							}
							className="h-8 text-xs text-center"
							maxLength={5}
						/>
					</div>

					<div className="w-full max-w-[80px] relative">
						<Label
							htmlFor="y-input"
							className="text-xs text-muted-foreground absolute top-2 left-2"
						>
							Y
						</Label>
						<Input
							id="y-input"
							type="number"
							value={textPosition.y}
							onChange={(e) =>
								onManualPositionChange(
									"y",
									Number(e.target.value),
								)
							}
							className="h-8 text-xs text-center"
							maxLength={5}
						/>
					</div>
				</div>

				<div className="pt-4 border-t border-border flex w-full justify-between">
					<div className="flex items-center justify-between w-full">
						<div className="space-y-0.5">
							<Label
								htmlFor="anchor-mode"
								className="text-xs font-medium"
							>
								Text Anchor
							</Label>
							<p className="text-xs text-muted-foreground">
								{anchorMode === "center"
									? "Center"
									: "Top-Left"}
							</p>
						</div>
						<Switch
							id="anchor-mode"
							checked={anchorMode === "left"}
							onCheckedChange={(checked) =>
								onAnchorModeChange(checked ? "left" : "center")
							}
						/>
					</div>
				</div>

				<div className="text-center pt-2 border-t border-border">
					<p className="text-xs text-muted-foreground">
						Position: ({textPosition.x}, {textPosition.y})
					</p>
				</div>
			</motion.div>
		</ScrollArea>
	);
};

export default PositionControls;
