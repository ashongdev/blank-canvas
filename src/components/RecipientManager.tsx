import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Recipient {
	name: string;
	email: string;
}

interface RecipientManagerProps {
	recipients: Recipient[];
	onRecipientsChange: (recipients: Recipient[]) => void;
}

const RecipientManager = ({
	recipients,
	onRecipientsChange,
}: RecipientManagerProps) => {
	const [newName, setNewName] = useState("");
	const [newEmail, setNewEmail] = useState("");

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const fileType = file.name.split(".").pop()?.toLowerCase();

		try {
			const text = await file.text();
			let parsedRecipients: Recipient[] = [];

			if (fileType === "json") {
				const data = JSON.parse(text);
				parsedRecipients = Array.isArray(data) ? data : [data];
			} else if (fileType === "csv") {
				const lines = text.split("\n").filter((line) => line.trim());
				const hasHeader =
					lines[0].toLowerCase().includes("name") ||
					lines[0].toLowerCase().includes("email");
				const dataLines = hasHeader ? lines.slice(1) : lines;

				parsedRecipients = dataLines.map((line) => {
					const [name, email] = line.split(",").map((s) => s.trim());
					return { name, email };
				});
			}

			// Validate recipients
			const validRecipients = parsedRecipients.filter(
				(r) => r.name && r.email
			);

			if (validRecipients.length === 0) {
				toast.error("No valid recipients found in file");
				return;
			}

			onRecipientsChange([...recipients, ...validRecipients]);
			toast.success(`Added ${validRecipients.length} recipient(s)`);
		} catch (error) {
			toast.error("Failed to parse file. Please check the format.");
		}

		e.target.value = "";
	};

	const handleAddManual = () => {
		if (!newName.trim() || !newEmail.trim()) {
			toast.error("Please enter both name and email");
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newEmail)) {
			toast.error("Please enter a valid email address");
			return;
		}

		onRecipientsChange([
			...recipients,
			{ name: newName.trim(), email: newEmail.trim() },
		]);
		setNewName("");
		setNewEmail("");
		toast.success("Recipient added");
	};

	const handleRemove = (index: number) => {
		onRecipientsChange(recipients.filter((_, i) => i !== index));
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="py-12"
		>
			<div className="container mx-auto px-6 max-w-4xl">
				<h2 className="text-xl font-semibold mb-6">Recipients</h2>

				{/* Upload Section */}
				<div className="space-y-4 mb-8">
					<Label
						htmlFor="recipients-upload"
						className="text-sm font-medium"
					>
						Upload Recipients (CSV or JSON)
					</Label>
					<label htmlFor="recipients-upload">
						<input
							id="recipients-upload"
							type="file"
							accept=".csv,.json"
							onChange={handleFileUpload}
							className="hidden"
						/>
						<Button
							variant="outline"
							className="w-full justify-start gap-2 hover:border-primary transition-smooth"
							asChild
						>
							<span>
								<Upload className="w-4 h-4" />
								Upload CSV or JSON
							</span>
						</Button>
					</label>
					<p className="text-xs text-muted-foreground">
						CSV format: name,email (one per line). JSON format: [
						{"{"}name: "...", email: "..."{"}"}]
					</p>
				</div>

				{/* Manual Entry */}
				<div className="space-y-4 mb-8">
					<Label className="text-sm font-medium">
						Add Recipient Manually
					</Label>
					<div className="flex gap-3">
						<Input
							placeholder="Name"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleAddManual()
							}
							className="flex-1"
							maxLength={100}
						/>
						<Input
							placeholder="Email"
							type="email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleAddManual()
							}
							className="flex-1"
							maxLength={100}
						/>
						<Button onClick={handleAddManual} className="gap-2">
							<Plus className="w-4 h-4" />
							Add
						</Button>
					</div>
				</div>

				{/* Recipients List */}
				{recipients.length > 0 && (
					<div className="space-y-3">
						<Label className="text-sm font-medium">
							Recipients List ({recipients.length})
						</Label>
						<div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-4">
							{recipients.map((recipient, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-smooth"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{recipient.name}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{recipient.email}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemove(index)}
										className="ml-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default RecipientManager;
