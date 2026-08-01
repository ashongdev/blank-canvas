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
		// Inherit the most recently used styling (and roughly the position)
		// from whichever field was active, instead of resetting to hardcoded
		// defaults every time. A small offset keeps the new field from
		// landing exactly on top of the one it's copied from.
		const newField: TextField = {
			id: uuidv4(),
			label: "New Field",
			text: "New Text",
			x: activeField.x + 20,
			y: activeField.y + 20,
			font: activeField.font,
			fontSize: activeField.fontSize,
			fontWeight: activeField.fontWeight,
			color: activeField.color,
			anchorMode: activeField.anchorMode,
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
