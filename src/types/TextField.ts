export type FieldPreset =
	| "text"
	| "name"
	| "date"
	| "course"
	| "organization"
	| "signatory"
	| "score"
	| "duration"
	| "id";

export interface TextField {
	id: string;
	label: string;
	text: string;
	/** Which preset this field was created from. Defaults to "text" when absent. */
	preset?: FieldPreset;
	/** Only meaningful when preset === "date": the date-fns format string applied to rawDate. */
	dateFormat?: string;
	/** Only meaningful when preset === "date": ISO date (yyyy-MM-dd) backing the date picker. */
	rawDate?: string;
	x: number;
	y: number;
	font: string;
	fontSize: number;
	fontWeight: string;
	color: string;
	anchorMode: "center" | "left";
	required?: boolean;
}

export interface Recipient {
	name: string;
	email: string;
}
