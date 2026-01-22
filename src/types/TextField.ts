export interface TextField {
	id: string;
	label: string; // "Name", "Course", "Date"
	text: string; // The sample text
	x: number;
	y: number;
	font: string;
	fontSize: number;
	fontWeight: string;
	color: string;
	anchorMode: "center" | "left";
}
