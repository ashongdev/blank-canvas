import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";
import type { Template } from "@/types/Template";

export const restartTour = (resetTour: () => void, startTour: () => void) => {
	resetTour();
	startTour();
};

export const copyLinkToClipboard = async (link: string) => {
	await navigator.clipboard.writeText(link);
	toast.success("Copied to clipboard");
};

export const openTemplateInEditor = (
	navigate: NavigateFunction,
	template: Template,
) => {
	const simulatedFields = [
		{
			id: "field-1",
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
	];

	navigate("/", {
		state: {
			templateUrl: template.url,
			fields: simulatedFields,
			templateFile: null,
		},
	});
};
