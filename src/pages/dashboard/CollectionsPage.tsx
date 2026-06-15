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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useClearSelectionOnOutside from "@/hooks/useClearSelectionOnOutside";
import ListPagination from "@/components/dashboard/ListPagination";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { Collection } from "@/hooks/useDashboardStore";
import { openTemplateInEditor } from "@/lib/editorUtils";
import { fetchTemplates, PAGE_SIZE } from "@/services/dashboardApi";
import { Template } from "@/types/Template";
import type { PaginationMeta } from "@/types/Pagination";
import { DEFAULT_PAGINATION, clampPageAfterDelete } from "@/types/Pagination";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowUpRightFromSquare,
	ChevronRight,
	FolderOpen,
	LayoutGrid,
	Loader2,
	MoreVertical,
	Pencil,
	Plus,
	Rows3,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
	isLoading: boolean;
	collections: Collection[];
	pagination: PaginationMeta;
	onPageChange: (page: number) => void;
	onCreate: (name: string) => void;
	onUpdate: (id: number, name: string) => void;
	onDelete: (id: number) => void;
	onAssignCollection: (
		templateId: number,
		collectionId: number | null,
	) => Promise<void>;
	onUploadToCollection: (collectionId: number, file: File) => Promise<void>;
}

const CollectionsPage = ({
	isLoading,
	collections,
	pagination,
	onPageChange,
	onCreate,
	onUpdate,
	onDelete,
	onAssignCollection,
	onUploadToCollection,
}: Props) => {
	type UploadingTemplate = {
		id: string;
		previewUrl: string;
		name: string;
	};

	const navigate = useNavigate();
	const { BASE_URL } = useAuthContext();
	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [visibleSkeletons, setVisibleSkeletons] = useState(1);
	const [editCol, setEditCol] = useState<Collection | null>(null);
	const [editName, setEditName] = useState("");
	const [deleteColId, setDeleteColId] = useState<number | null>(null);
	const [openedCollection, setOpenedCollection] = useState<Collection | null>(
		null,
	);
	const [selectedCollectionId, setSelectedCollectionId] = useState<
		number | null
	>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
		null,
	);
	const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
	const [isUploadingToCollection, setIsUploadingToCollection] =
		useState(false);
	const [uploadingTemplates, setUploadingTemplates] = useState<
		UploadingTemplate[]
	>([]);
	const [detailTemplates, setDetailTemplates] = useState<Template[]>([]);
	const [detailPagination, setDetailPagination] =
		useState<PaginationMeta>(DEFAULT_PAGINATION);
	const [detailPage, setDetailPage] = useState(1);
	const [isDetailLoading, setIsDetailLoading] = useState(false);
	const isListLayout = layoutMode === "list";

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

	const selectedCollection = collections.find(
		(c) => c.id === selectedCollectionId,
	);
	const selectedTemplate = detailTemplates.find(
		(t) => t.id === selectedTemplateId,
	);

	const loadCollectionTemplates = useCallback(
		async (collectionId: number, page: number) => {
			setIsDetailLoading(true);
			try {
				const response = await fetchTemplates(BASE_URL, {
					state: "active",
					page,
					pageSize: PAGE_SIZE,
					collectionId,
				});
				setDetailTemplates(response.templates);
				setDetailPagination(response.pagination);
				setDetailPage(response.pagination.page);
			} finally {
				setIsDetailLoading(false);
			}
		},
		[BASE_URL],
	);

	useEffect(() => {
		if (!openedCollection) return;
		void loadCollectionTemplates(openedCollection.id, detailPage);
	}, [openedCollection, detailPage, loadCollectionTemplates]);

	useEffect(() => {
		if (openedCollection) {
			setDetailPage(1);
			setSelectedTemplateId(null);
		}
	}, [openedCollection?.id]);

	useClearSelectionOnOutside({
		enabled: openedCollection === null && selectedCollectionId !== null,
		selectors: ["[data-collection-card]", "[data-collection-dock]"],
		onClear: () => setSelectedCollectionId(null),
	});

	useClearSelectionOnOutside({
		enabled: openedCollection !== null && selectedTemplateId !== null,
		selectors: [
			"[data-collection-template-card]",
			"[data-collection-template-dock]",
		],
		onClear: () => setSelectedTemplateId(null),
	});

	const handleUploadToOpenedCollection = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (!openedCollection) return;

		const file = e.target.files?.[0];
		e.currentTarget.value = "";
		if (!file) return;

		const uploadId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const previewUrl = URL.createObjectURL(file);

		setUploadingTemplates((prev) => [
			...prev,
			{
				id: uploadId,
				previewUrl,
				name: file.name,
			},
		]);

		setIsUploadingToCollection(true);
		try {
			await onUploadToCollection(openedCollection.id, file);
			setDetailPage(1);
			await loadCollectionTemplates(openedCollection.id, 1);
		} finally {
			setUploadingTemplates((prev) =>
				prev.filter((upload) => upload.id !== uploadId),
			);
			URL.revokeObjectURL(previewUrl);
			setIsUploadingToCollection(false);
		}
	};

	useEffect(() => {
		return () => {
			uploadingTemplates.forEach((upload) => {
				URL.revokeObjectURL(upload.previewUrl);
			});
		};
	}, [uploadingTemplates]);

	useEffect(() => {
		if (
			selectedCollectionId !== null &&
			!collections.some((c) => c.id === selectedCollectionId)
		) {
			setSelectedCollectionId(null);
		}
	}, [collections, selectedCollectionId]);

	useEffect(() => {
		if (
			selectedTemplateId !== null &&
			!detailTemplates.some((t) => t.id === selectedTemplateId)
		) {
			setSelectedTemplateId(null);
		}
	}, [detailTemplates, selectedTemplateId]);

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
				<div
					className={
						isListLayout
							? "space-y-3"
							: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
					}
				>
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
		const colTemplates = detailTemplates;
		const hasDisplayTemplates =
			colTemplates.length > 0 || uploadingTemplates.length > 0;
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
					<div className="flex items-center gap-3">
						<div className="flex items-center rounded-md border border-border p-1">
							<Button
								size="icon"
								variant={
									layoutMode === "grid"
										? "secondary"
										: "ghost"
								}
								className="h-8 w-8"
								onClick={() => setLayoutMode("grid")}
							>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant={
									layoutMode === "list"
										? "secondary"
										: "ghost"
								}
								className="h-8 w-8"
								onClick={() => setLayoutMode("list")}
							>
								<Rows3 className="h-4 w-4" />
							</Button>
						</div>
						<h2 className="text-2xl font-semibold text-foreground">
							{openedCollection.name}
						</h2>
					</div>
					<div className="flex items-center gap-3">
						<p className="text-sm text-muted-foreground">
							{detailPagination.total_count} template
							{detailPagination.total_count !== 1 ? "s" : ""}
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
							{isUploadingToCollection ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								"Upload Template"
							)}
						</Button>
					</div>
				</div>
				<p className="text-xs text-muted-foreground -mt-2">
					Tip: Click a template card to select. Double-click to open
					it in the editor.
				</p>

				{isDetailLoading ? (
					<div className="min-h-[20vh] flex items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : !hasDisplayTemplates ? (
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
					<>
					<div
						className={
							isListLayout
								? "space-y-0"
								: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
						}
					>
						{uploadingTemplates.map((upload) => (
							<Card
								key={upload.id}
								className={`group overflow-hidden border-border opacity-80 ${
									isListLayout
										? "flex items-center min-h-14 rounded-none border-x-0 border-t-0 shadow-none transition-colors hover:bg-muted/30"
										: ""
								}`}
							>
								<div
									className={`relative bg-muted flex items-center justify-center overflow-hidden ${
										isListLayout
											? "h-14 w-20 sm:w-24 shrink-0"
											: "aspect-[4/3]"
									}`}
								>
									<img
										src={upload.previewUrl}
										alt={upload.name}
										className="w-full h-full object-cover grayscale"
									/>
									<div className="absolute inset-0 bg-background/55 flex items-center justify-center">
										<div className="flex items-center gap-2 text-sm text-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											Uploading
										</div>
									</div>
								</div>
								<CardContent
									className={`flex-1 min-w-0 ${isListLayout ? "p-2" : "p-3"}`}
								>
									<div className="flex items-center justify-between gap-3">
										<p className="text-sm text-foreground truncate">
											<span className="font-medium">
												{upload.name}
											</span>
										</p>
										<p className="text-xs text-muted-foreground shrink-0">
											Pending upload...
										</p>
									</div>
								</CardContent>
							</Card>
						))}
						{colTemplates.map((t) => (
							<Card
								key={t.id}
								data-collection-template-card
								className={`group overflow-hidden cursor-pointer ${
									isListLayout
										? "flex items-center min-h-14 rounded-none border-x-0 border-t-0 shadow-none"
										: "transition-shadow"
								} ${
									selectedTemplateId === t.id
										? isListLayout
											? "border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
											: "border-primary ring-2 ring-primary/30 shadow-md"
										: isListLayout
											? "border-border hover:bg-muted/40 transition-colors"
											: "border-border hover:shadow-md"
								}`}
								onClick={() => setSelectedTemplateId(t.id)}
								onDoubleClick={() =>
									openTemplateInEditor(navigate, t)
								}
							>
								<div
									className={`bg-muted flex items-center justify-center overflow-hidden ${
										isListLayout
											? "h-14 w-20 sm:w-24 shrink-0"
											: "aspect-[4/3]"
									}`}
								>
									<img
										src={t.url}
										alt={t.name}
										className="w-full h-full object-cover"
									/>
								</div>
								<CardContent
									className={`flex-1 min-w-0 flex items-center justify-between gap-3 ${isListLayout ? "p-2" : "p-3"}`}
								>
									<div className="min-w-0">
										{isListLayout ? (
											<p className="text-sm text-foreground truncate">
												<span className="font-medium">
													{t.name}
												</span>
												<span className="text-xs text-muted-foreground">
													{" "}
													· {t.public_id}
												</span>
											</p>
										) : (
											<>
												<p className="text-sm font-medium text-foreground truncate">
													{t.name}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													{t.public_id}
												</p>
											</>
										)}
									</div>
									<Button
										variant="ghost"
										size="sm"
										className={`text-xs text-muted-foreground hover:text-destructive shrink-0 ${isListLayout ? "h-7 px-2" : ""}`}
										onClick={(event) => {
											event.stopPropagation();
											void (async () => {
												await onAssignCollection(
													t.id,
													null,
												);
												const nextPage =
													clampPageAfterDelete(
														detailPagination,
													);
												if (nextPage !== detailPage) {
													setDetailPage(nextPage);
												} else {
													await loadCollectionTemplates(
														openedCollection.id,
														detailPage,
													);
												}
											})();
										}}
									>
										Remove
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
					<ListPagination
						pagination={detailPagination}
						onPageChange={setDetailPage}
						isLoading={isDetailLoading}
						className="pt-2"
					/>
					</>
				)}

				<AnimatePresence>
					{selectedTemplate && (
						<motion.div
							className="fixed bottom-6 right-6 z-40"
							data-collection-template-dock
							initial={{ opacity: 0, y: 24, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.97 }}
							transition={{
								type: "spring",
								stiffness: 620,
								damping: 16,
								mass: 0.55,
							}}
						>
							<div className="flex items-center gap-2 rounded-full border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											size="icon"
											variant="outline"
											onClick={() =>
												openTemplateInEditor(
													navigate,
													selectedTemplate,
												)
											}
										>
											<ArrowUpRightFromSquare className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										Open in Editor
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											size="icon"
											variant="destructive"
										onClick={() =>
											void (async () => {
												await onAssignCollection(
													selectedTemplate.id,
													null,
												);
												const nextPage =
													clampPageAfterDelete(
														detailPagination,
													);
												if (nextPage !== detailPage) {
													setDetailPage(nextPage);
												} else {
													await loadCollectionTemplates(
														openedCollection.id,
														detailPage,
													);
												}
											})()
										}
										>
											<X className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										Remove from Collection
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												setSelectedTemplateId(null)
											}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										Clear Selection
									</TooltipContent>
								</Tooltip>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

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
				<div className="flex items-center gap-3">
					<div className="flex items-center rounded-md border border-border p-1">
						<Button
							size="icon"
							variant={
								layoutMode === "grid" ? "secondary" : "ghost"
							}
							className="h-8 w-8"
							onClick={() => setLayoutMode("grid")}
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant={
								layoutMode === "list" ? "secondary" : "ghost"
							}
							className="h-8 w-8"
							onClick={() => setLayoutMode("list")}
						>
							<Rows3 className="h-4 w-4" />
						</Button>
					</div>
					<h2 className="text-2xl font-semibold text-foreground">
						Collections
					</h2>
				</div>
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
				<>
				<div
					className={
						isListLayout
							? "space-y-0"
							: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
					}
				>
					{collections.map((col) => {
						const templateCount = col.template_count ?? 0;
						return (
							<Card
								key={col.id}
								data-collection-card
								className={`cursor-pointer ${
									isListLayout
										? "min-h-14 rounded-none border-x-0 border-t-0 shadow-none"
										: "transition-shadow"
								} ${
									selectedCollectionId === col.id
										? isListLayout
											? "border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
											: "border-primary ring-2 ring-primary/30 shadow-md"
										: isListLayout
											? "border-border hover:bg-muted/40 transition-colors"
											: "border-border hover:shadow-md"
								}`}
								onClick={() => setSelectedCollectionId(col.id)}
								onDoubleClick={() => setOpenedCollection(col)}
							>
								<CardContent
									className={
										isListLayout ? "p-2" : "p-4 space-y-3"
									}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 min-w-0">
											<FolderOpen className="h-5 w-5 text-primary shrink-0" />
											{isListLayout ? (
												<p className="text-sm text-foreground truncate">
													<span className="font-medium">
														{col.name}
													</span>
													<span className="text-xs text-muted-foreground">
														{" "}
														· {templateCount}{" "}
														template
														{templateCount !== 1
															? "s"
															: ""}
													</span>
												</p>
											) : (
												<>
													<span className="font-medium text-foreground truncate">
														{col.name}
													</span>
													<Badge
														variant="secondary"
														className="text-xs"
													>
														{templateCount}
													</Badge>
												</>
											)}
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
									{!isListLayout && (
										<p className="text-xs text-muted-foreground">
											{templateCount} template
											{templateCount !== 1 ? "s" : ""}{" "}
											· Click to view
										</p>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
				<ListPagination
					pagination={pagination}
					onPageChange={onPageChange}
					isLoading={isLoading}
					className="pt-2"
				/>
				</>
			)}

			<AnimatePresence>
				{selectedCollection && (
					<motion.div
						className="fixed bottom-6 right-6 z-40"
						data-collection-dock
						initial={{ opacity: 0, y: 24, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.97 }}
						transition={{
							type: "spring",
							stiffness: 620,
							damping: 16,
							mass: 0.55,
						}}
					>
						<div className="flex items-center gap-2 rounded-full border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="outline"
										onClick={() =>
											setOpenedCollection(
												selectedCollection,
											)
										}
									>
										<ArrowUpRightFromSquare className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Open Collection</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="outline"
										onClick={() => {
											setEditCol(selectedCollection);
											setEditName(
												selectedCollection.name,
											);
										}}
									>
										<Pencil className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									Rename Collection
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="destructive"
										onClick={() =>
											setDeleteColId(
												selectedCollection.id,
											)
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									Delete Collection
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="ghost"
										onClick={() =>
											setSelectedCollectionId(null)
										}
									>
										<X className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Clear Selection</TooltipContent>
							</Tooltip>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

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
