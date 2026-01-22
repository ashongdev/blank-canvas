export interface TextField {
	id: string;
	label: string;
	text: string;
	x: number;
	y: number;
	font: string;
	fontSize: number;
	fontWeight: string;
	color: string;
	anchorMode: "center" | "left";
	required?: boolean;
}
