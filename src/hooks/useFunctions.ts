import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { TextField } from "@/types/TextField";

interface UseFunctionsProps {
	fields: TextField[];
	selectedFieldId: string;
	activeField: TextField;
	setFields: React.Dispatch<React.SetStateAction<TextField[]>>;
	setSelectedFieldId: React.Dispatch<React.SetStateAction<string>>;
}

const useFunctions = ({
	fields,
	selectedFieldId,
	activeField,
	setFields,
	setSelectedFieldId,
}: UseFunctionsProps) => {
	const updateField = (id: string, updates: Partial<TextField>) => {
		setFields((prev) =>
			prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
		);
	};

	const addField = () => {
		const newField: TextField = {
			id: uuidv4(),
			label: "New Field",
			text: "New Text",
			x: 0,
			y: 0,
			font: "Bickham Script Pro Regular",
			fontSize: 100,
			fontWeight: "300",
			color: "#000000",
			anchorMode: "center",
			required: false,
		};

		setFields((prev) => [...prev, newField]);
		setSelectedFieldId(newField.id);
	};

	const removeField = (id: string) => {
		if (fields.length <= 1) {
			toast.error("Cannot remove the last field");
			return;
		}

		setFields((prev) => prev.filter((f) => f.id !== id));

		if (selectedFieldId === id) {
			setSelectedFieldId(fields[0].id);
		}
	};

	const handlePositionChange = (axis: "x" | "y", direction: number) => {
		updateField(selectedFieldId, {
			[axis]: activeField[axis] + direction,
		});
	};

	const handleManualPositionChange = (axis: "x" | "y", value: number) => {
		updateField(selectedFieldId, {
			[axis]: value,
		});
	};

	return {
		addField,
		removeField,
		handlePositionChange,
		handleManualPositionChange,
		updateField,
	};
};

export default useFunctions;
