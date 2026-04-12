import { toast } from "sonner";

export const restartTour = (resetTour: () => void, startTour: () => void) => {
	resetTour();
	startTour();
};

export const copyLinkToClipboard = async (link: string) => {
	await navigator.clipboard.writeText(link);
	toast.success("Copied to clipboard");
};
