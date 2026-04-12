import { useEffect, useState } from "react";
import {
	FolderOpen,
	MoreVertical,
	Pencil,
	Trash2,
	Plus,
	X,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Collection } from "@/hooks/useDashboardStore";
import { Template } from "@/types/Template";

interface Props {
	isLoading: boolean;
	collections: Collection[];
	templates: Template[];
	onCreate: (name: string) => void;
	onUpdate: (id: number, name: string) => void;
	onDelete: (id: number) => void;
	onAssignCollection: (
		templateId: number,
		collectionId: number | null,
	) => void;
	onUploadToCollection: (collectionId: number, file: File) => Promise<void>;
}

const CollectionsPage = ({
	isLoading,
	collections,
	templates,
	onCreate,
	onUpdate,
	onDelete,
	onAssignCollection,
	onUploadToCollection,
}: Props) => {
	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [visibleSkeletons, setVisibleSkeletons] = useState(1);
	const [editCol, setEditCol] = useState<Collection | null>(null);
	const [editName, setEditName] = useState("");
	const [deleteColId, setDeleteColId] = useState<number | null>(null);
	const [openedCollection, setOpenedCollection] = useState<Collection | null>(
		null,
	);
	const [isUploadingToCollection, setIsUploadingToCollection] =
		useState(false);

	const handleCreate = () => {
		if (newName.trim()) {
			onCreate(newName.trim());
			setNewName("");
			setCreating(false);
		}
	};

	const saveEdit = () => {
		if (editCol && editName.trim()) {
			onUpdate(editCol.id, editName.trim());
			setEditCol(null);
		}
	};

	const templatesInCollection = (colId: number) =>
		templates.filter((t) => t.collection_id === colId && !t.trashed);

	const handleUploadToOpenedCollection = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (!openedCollection) return;

		const file = e.target.files?.[0];
		e.currentTarget.value = "";
		if (!file) return;

		setIsUploadingToCollection(true);
		try {
			await onUploadToCollection(openedCollection.id, file);
		} finally {
			setIsUploadingToCollection(false);
		}
	};

	useEffect(() => {
		if (!isLoading) return;

		setVisibleSkeletons(1);
		const timer = window.setInterval(() => {
			setVisibleSkeletons((prev) => Math.min(prev + 1, 6));
		}, 90);

		return () => {
			window.clearInterval(timer);
		};
	}, [isLoading]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
					<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
					<p className="text-sm text-muted-foreground">
						Loading collections...
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: visibleSkeletons }).map(
						(_, index) => (
							<Card
								key={`collection-skeleton-${index}`}
								className="border-border"
							>
								<CardContent className="p-4 space-y-3">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
						),
					)}
				</div>
			</div>
		);
	}

	// If a collection is opened, show the detail view
	if (openedCollection) {
		const colTemplates = templatesInCollection(openedCollection.id);
		return (
			<div className="space-y-6">
				<input
					type="file"
					id="collection-upload-input"
					className="hidden"
					accept="image/*"
					onChange={handleUploadToOpenedCollection}
				/>
				{/* Breadcrumbs */}
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<button
						onClick={() => setOpenedCollection(null)}
						className="hover:text-foreground transition-colors"
					>
						Dashboard
					</button>
					<ChevronRight className="h-3 w-3" />
					<button
						onClick={() => setOpenedCollection(null)}
						className="hover:text-foreground transition-colors"
					>
						Collections
					</button>
					<ChevronRight className="h-3 w-3" />
					<span className="text-foreground font-medium">
						{openedCollection.name}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-foreground">
						{openedCollection.name}
					</h2>
					<div className="flex items-center gap-3">
						<p className="text-sm text-muted-foreground">
							{colTemplates.length} template
							{colTemplates.length !== 1 ? "s" : ""}
						</p>
						<Button
							size="sm"
							onClick={() =>
								document
									.getElementById("collection-upload-input")
									?.click()
							}
							disabled={isUploadingToCollection}
						>
							{isUploadingToCollection
								? "Uploading..."
								: "Upload Template"}
						</Button>
					</div>
				</div>

				{colTemplates.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
						<FolderOpen className="h-12 w-12 mb-3 opacity-40" />
						<p className="text-lg">
							No templates in this collection
						</p>
						<p className="text-sm">
							Upload one now or assign templates from Templates.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{colTemplates.map((t) => (
							<Card
								key={t.id}
								className="group overflow-hidden border-border hover:shadow-md transition-shadow"
							>
								<div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
									<img
										src={t.url}
										alt={t.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<CardContent className="p-3 flex items-center justify-between">
									<div className="min-w-0">
										<p className="text-sm font-medium text-foreground truncate">
											{t.name}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{t.public_id}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-xs text-muted-foreground hover:text-destructive shrink-0"
										onClick={() =>
											onAssignCollection(t.id, null)
										}
									>
										Remove
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => setOpenedCollection(null)}
				>
					← Back to Collections
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-foreground">
					Collections
				</h2>
				{!creating ? (
					<Button size="sm" onClick={() => setCreating(true)}>
						<Plus className="mr-2 h-4 w-4" /> New Collection
					</Button>
				) : (
					<div className="flex items-center gap-2">
						<Input
							autoFocus
							placeholder="Collection name..."
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) =>
								e.key === "Enter" && handleCreate()
							}
							className="h-9 w-48"
						/>
						<Button size="sm" onClick={handleCreate}>
							Add
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => {
								setCreating(false);
								setNewName("");
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>

			{collections.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
					<FolderOpen className="h-12 w-12 mb-3 opacity-40" />
					<p className="text-lg">No collections yet</p>
					<p className="text-sm">
						Create a collection to organize your templates.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{collections.map((col) => {
						const colTemplates = templatesInCollection(col.id);
						return (
							<Card
								key={col.id}
								className="border-border hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => setOpenedCollection(col)}
							>
								<CardContent className="p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 min-w-0">
											<FolderOpen className="h-5 w-5 text-primary shrink-0" />
											<span className="font-medium text-foreground truncate">
												{col.name}
											</span>
											<Badge
												variant="secondary"
												className="text-xs"
											>
												{colTemplates.length}
											</Badge>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger
												asChild
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 shrink-0"
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														setEditCol(col);
														setEditName(col.name);
													}}
												>
													<Pencil className="mr-2 h-4 w-4" />{" "}
													Rename
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														setDeleteColId(col.id);
													}}
												>
													<Trash2 className="mr-2 h-4 w-4" />{" "}
													Delete Collection
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<p className="text-xs text-muted-foreground">
										{colTemplates.length} template
										{colTemplates.length !== 1 ? "s" : ""} ·
										Click to view
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Rename dialog */}
			<Dialog
				open={!!editCol}
				onOpenChange={(o) => !o && setEditCol(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Collection</DialogTitle>
						<DialogDescription>
							Enter a new name for this collection.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<Label>Name</Label>
						<Input
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && saveEdit()}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditCol(null)}
						>
							Cancel
						</Button>
						<Button onClick={saveEdit}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete collection confirmation */}
			<AlertDialog
				open={!!deleteColId}
				onOpenChange={(o) => !o && setDeleteColId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Collection?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove the collection grouping. Templates
							inside will not be deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteColId) {
									onDelete(deleteColId);
									setDeleteColId(null);
								}
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default CollectionsPage;
