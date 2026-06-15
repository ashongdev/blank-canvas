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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useClearSelectionOnOutside from "@/hooks/useClearSelectionOnOutside";
import ListPagination from "@/components/dashboard/ListPagination";
import { Template } from "@/types/Template";
import type { PaginationMeta } from "@/types/Pagination";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Loader2, RotateCcw, Rows3, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
	templates: Template[];
	isLoading: boolean;
	pagination: PaginationMeta;
	onPageChange: (page: number) => void;
	onRestore: (id: number) => void;
	onPermanentlyDelete: (id: number) => void;
}

const TrashPage = ({
	templates,
	isLoading,
	pagination,
	onPageChange,
	onRestore,
	onPermanentlyDelete,
}: Props) => {
	const [restoreId, setRestoreId] = useState<number | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
		null,
	);
	const [visibleSkeletons, setVisibleSkeletons] = useState(1);
	const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
	const isListLayout = layoutMode === "list";
	const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
	const templateToRestore = templates.find((t) => t.id === restoreId);
	const templateToDelete = templates.find((t) => t.id === deleteId);

	useClearSelectionOnOutside({
		enabled: selectedTemplateId !== null,
		selectors: ["[data-trash-card]", "[data-trash-dock]"],
		onClear: () => setSelectedTemplateId(null),
	});

	useEffect(() => {
		if (!isLoading) return;

		setVisibleSkeletons(1);
		const timer = window.setInterval(() => {
			setVisibleSkeletons((prev) => Math.min(prev + 1, 8));
		}, 90);

		return () => {
			window.clearInterval(timer);
		};
	}, [isLoading]);

	useEffect(() => {
		if (
			selectedTemplateId !== null &&
			!templates.some((t) => t.id === selectedTemplateId)
		) {
			setSelectedTemplateId(null);
		}
	}, [selectedTemplateId, templates]);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<>
					<div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
						<p className="text-sm text-muted-foreground">
							Loading trash...
						</p>
					</div>
					<div
						className={
							isListLayout
								? "space-y-0"
								: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
						}
					>
						{Array.from({ length: visibleSkeletons }).map(
							(_, index) => (
								<Card
									key={`trash-skeleton-${index}`}
									className={`border-border ${isListLayout ? "flex rounded-none border-x-0 border-t-0 shadow-none" : ""}`}
								>
									<Skeleton
										className={
											isListLayout
												? "h-12 w-16 sm:w-20 rounded-none"
												: "aspect-[4/3] w-full rounded-b-none rounded-t-lg"
										}
									/>
									<CardContent
										className={`flex-1 ${isListLayout ? "p-2" : "p-3 space-y-3"}`}
									>
										{isListLayout ? (
											<div className="flex items-center justify-between gap-3">
												<Skeleton className="h-4 w-2/3" />
												<Skeleton className="h-7 w-28" />
											</div>
										) : (
											<>
												<Skeleton className="h-4 w-2/3" />
												<Skeleton className="h-3 w-1/2" />
												<Skeleton className="h-8 w-full" />
											</>
										)}
									</CardContent>
								</Card>
							),
						)}
					</div>
				</>
			) : (
				<>
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
								Trash
							</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							{pagination.total_count} item
							{pagination.total_count !== 1 ? "s" : ""}
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
						<>
						<div
							className={
								isListLayout
									? "space-y-0"
									: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
							}
						>
							{templates.map((t) => (
								<Card
									key={t.id}
									data-trash-card
									className={`cursor-pointer ${
										isListLayout
											? "flex items-center min-h-12 rounded-none border-x-0 border-t-0 shadow-none transition-colors hover:bg-muted/40"
											: "opacity-75 hover:opacity-100 transition-opacity"
									} ${
										selectedTemplateId === t.id
											? isListLayout
												? "border-primary bg-primary/5 hover:bg-primary/10"
												: "border-primary ring-2 ring-primary/30 shadow-md"
											: "border-border"
									}`}
									onClick={() => setSelectedTemplateId(t.id)}
									onDoubleClick={() => setRestoreId(t.id)}
								>
									<div
										className={`bg-muted flex items-center justify-center overflow-hidden ${
											isListLayout
												? "h-12 w-16 sm:w-20 shrink-0"
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
										className={`flex-1 ${isListLayout ? "p-2" : "p-3 space-y-2"}`}
									>
										{isListLayout ? (
											<div className="flex items-center justify-between gap-3">
												<p className="text-sm text-foreground truncate">
													<span className="font-medium">
														{t.name}
													</span>
													<span className="text-xs text-muted-foreground">
														{" "}
														· {t.public_id}
													</span>
												</p>
												<div className="flex items-center gap-1 shrink-0">
													<Button
														variant="outline"
														size="sm"
														className="h-7 px-2"
														onClick={(e) => {
															e.stopPropagation();
															setRestoreId(t.id);
														}}
													>
														<RotateCcw className="mr-1 h-3 w-3" />
														Restore
													</Button>
													<Button
														variant="destructive"
														size="sm"
														className="h-7 px-2"
														onClick={(e) => {
															e.stopPropagation();
															setDeleteId(t.id);
														}}
													>
														<Trash2 className="mr-1 h-3 w-3" />
														Delete
													</Button>
												</div>
											</div>
										) : (
											<>
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
														onClick={(e) => {
															e.stopPropagation();
															setRestoreId(t.id);
														}}
													>
														<RotateCcw className="mr-1 h-3 w-3" />{" "}
														Restore
													</Button>
													<Button
														variant="destructive"
														size="sm"
														className="flex-1"
														onClick={(e) => {
															e.stopPropagation();
															setDeleteId(t.id);
														}}
													>
														<Trash2 className="mr-1 h-3 w-3" />{" "}
														Delete
													</Button>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							))}
						</div>
						<ListPagination
							pagination={pagination}
							onPageChange={onPageChange}
							isLoading={isLoading}
							className="pt-2"
						/>
						</>
					)}
				</>
			)}

			<AnimatePresence>
				{selectedTemplate && (
					<motion.div
						className="fixed bottom-6 right-6 z-40"
						data-trash-dock
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
											setRestoreId(selectedTemplate.id)
										}
									>
										<RotateCcw className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Restore</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										variant="destructive"
										onClick={() =>
											setDeleteId(selectedTemplate.id)
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									Delete Permanently
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
										<X className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Clear Selection</TooltipContent>
							</Tooltip>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Permanent delete confirmation */}
			<AlertDialog
				open={!!deleteId}
				onOpenChange={(o) => !o && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Template?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete "
							{templateToDelete?.name}" from Trash. This action
							cannot be undone.
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
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={!!restoreId}
				onOpenChange={(o) => !o && setRestoreId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Restore Template?</AlertDialogTitle>
						<AlertDialogDescription>
							This will move "{templateToRestore?.name}" back to
							your templates list.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (restoreId) {
									onRestore(restoreId);
									setRestoreId(null);
								}
							}}
						>
							Restore
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default TrashPage;
