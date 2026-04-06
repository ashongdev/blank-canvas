import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Template } from "@/types/Template";

interface Props {
	templates: Template[];
	onRestore: (id: number) => void;
	onPermanentlyDelete: (id: number) => void;
}

const TrashPage = ({ templates, onRestore, onPermanentlyDelete }: Props) => {
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const templateToDelete = templates.find((t) => t.id === deleteId);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-foreground">
					Trash
				</h2>
				<p className="text-sm text-muted-foreground">
					{templates.length} item{templates.length !== 1 ? "s" : ""}
				</p>
			</div>

			{templates.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
					<Trash2 className="h-12 w-12 mb-3 opacity-40" />
					<p className="text-lg">Trash is empty</p>
					<p className="text-sm">
						Deleted templates will appear here.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{templates.map((t) => (
						<Card
							key={t.id}
							className="border-border opacity-75 hover:opacity-100 transition-opacity"
						>
							<div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
								<img
									src={t.url}
									alt={t.name}
									className="w-full h-full object-cover"
								/>
							</div>
							<CardContent className="p-3 space-y-2">
								<div>
									<p className="text-sm font-medium text-foreground truncate">
										{t.name}
									</p>
									<p className="text-xs text-muted-foreground truncate">
										{t.public_id}
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => onRestore(t.id)}
									>
										<RotateCcw className="mr-1 h-3 w-3" />{" "}
										Restore
									</Button>
									<Button
										variant="destructive"
										size="sm"
										className="flex-1"
										onClick={() => setDeleteId(t.id)}
									>
										<Trash2 className="mr-1 h-3 w-3" />{" "}
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Permanent delete confirmation */}
			<AlertDialog
				open={!!deleteId}
				onOpenChange={(o) => !o && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />{" "}
							Permanently Delete?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove "
							{templateToDelete?.name}". This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteId) {
									onPermanentlyDelete(deleteId);
									setDeleteId(null);
								}
							}}
						>
							Delete Forever
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default TrashPage;
