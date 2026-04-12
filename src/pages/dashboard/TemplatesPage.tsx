import { useEffect, useState } from "react";
import {
	MoreVertical,
	Pencil,
	Trash2,
	FolderPlus,
	RefreshCw,
	Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
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
import { useNavigate } from "react-router-dom";
import type { Collection } from "@/hooks/useDashboardStore";
import { Template } from "@/types/Template";

interface Props {
	templates: Template[];
	isLoading: boolean;
	collections: Collection[];
	onTrash: (id: number) => void;
	onUpdate: (id: number, updates: Partial<Template>) => void;
	onAssignCollection: (
		templateId: number,
		collectionId: number | null,
	) => void;
	onUploadTemplate: (
		collectionId: number | null,
		file: File,
	) => Promise<void>;
}

const TemplatesPage = ({
	templates,
	isLoading,
	collections,
	onTrash,
	onUpdate,
	onAssignCollection,
	onUploadTemplate,
}: Props) => {
	type UploadingTemplate = {
		id: string;
		previewUrl: string;
		name: string;
	};

	const navigate = useNavigate();
	const [editTemplate, setEditTemplate] = useState<Template | null>(null);
	const [editName, setEditName] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [visibleSkeletons, setVisibleSkeletons] = useState(1);
	const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
	const [uploadingTemplates, setUploadingTemplates] = useState<
		UploadingTemplate[]
	>([]);

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

	const openEdit = (t: Template) => {
		setEditTemplate(t);
		setEditName(t.name);
	};

	const saveEdit = () => {
		if (editTemplate && editName.trim()) {
			onUpdate(editTemplate.id, { name: editName.trim() });
			setEditTemplate(null);
		}
	};

	const handleUpdateTemplate = (t: Template) => {
		// Simulate loading template data + presets, then navigate to editor
		const simulatedFields = [
			{
				id: "field-1",
				label: "Participant Name",
				text: "John Doe",
				x: 0,
				y: 0,
				font: "Bickham Script Pro Regular",
				fontSize: 100,
				fontWeight: "300",
				color: "#000000",
				anchorMode: "center",
				required: true,
			},
		];
		navigate("/", {
			state: {
				templateUrl: t.url,
				fields: simulatedFields,
				templateFile: null,
			},
		});
	};

	const handleTemplateUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
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

		setIsUploadingTemplate(true);
		try {
			await onUploadTemplate(null, file);
		} finally {
			setUploadingTemplates((prev) =>
				prev.filter((upload) => upload.id !== uploadId),
			);
			URL.revokeObjectURL(previewUrl);
			setIsUploadingTemplate(false);
		}
	};

	useEffect(() => {
		return () => {
			uploadingTemplates.forEach((upload) => {
				URL.revokeObjectURL(upload.previewUrl);
			});
		};
	}, [uploadingTemplates]);

	return (
		<div className="space-y-6">
			{isLoading ? (
				<>
					<div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
						<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
						<p className="text-sm text-muted-foreground">
							Loading templates...
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{Array.from({ length: visibleSkeletons }).map(
							(_, index) => (
								<Card
									key={`template-skeleton-${index}`}
									className="border-border"
								>
									<Skeleton className="aspect-[4/3] w-full rounded-b-none rounded-t-lg" />
									<CardContent className="p-3 space-y-3">
										<Skeleton className="h-4 w-2/3" />
										<Skeleton className="h-3 w-1/2" />
									</CardContent>
								</Card>
							),
						)}
					</div>
				</>
			) : (
				<>
					<input
						type="file"
						id="templates-upload-input"
						className="hidden"
						accept="image/*"
						onChange={handleTemplateUpload}
					/>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<h2 className="text-2xl font-semibold text-foreground">
								My Templates
							</h2>
							<p className="text-sm text-muted-foreground">
								{templates.length + uploadingTemplates.length}{" "}
								template
								{templates.length +
									uploadingTemplates.length !==
								1
									? "s"
									: ""}
							</p>
						</div>
						<Button
							onClick={() =>
								document
									.getElementById("templates-upload-input")
									?.click()
							}
							disabled={isUploadingTemplate}
							className="gap-2"
						>
							{isUploadingTemplate ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<span>+</span>
									Add Template
								</>
							)}
						</Button>
					</div>
					<p className="text-xs text-muted-foreground -mt-2">
						Tip: Double-click a template card to open it in the
						editor.
					</p>

					{templates.length === 0 &&
					uploadingTemplates.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
							<p className="text-lg">No templates yet</p>
							<p className="text-sm">
								Upload a template to get started.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{uploadingTemplates.map((upload) => (
								<Card
									key={upload.id}
									className="group overflow-hidden border-border opacity-80"
								>
									<div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
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
									<CardContent className="p-3">
										<p className="text-sm font-medium text-foreground truncate">
											{upload.name}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											Pending upload...
										</p>
									</CardContent>
								</Card>
							))}
							{templates &&
								templates.length > 0 &&
								templates.map((t) => (
									<Card
										key={t.id}
										className="group overflow-hidden border-border hover:shadow-md transition-shadow"
										onDoubleClick={() =>
											handleUpdateTemplate(t)
										}
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
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="shrink-0 h-8 w-8"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															openEdit(t)
														}
													>
														<Pencil className="mr-2 h-4 w-4" />{" "}
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() =>
															handleUpdateTemplate(
																t,
															)
														}
													>
														<RefreshCw className="mr-2 h-4 w-4" />{" "}
														Update Template
													</DropdownMenuItem>
													<DropdownMenuSub>
														<DropdownMenuSubTrigger>
															<FolderPlus className="mr-2 h-4 w-4" />{" "}
															Add to Collection
														</DropdownMenuSubTrigger>
														<DropdownMenuSubContent>
															<DropdownMenuItem
																onClick={() =>
																	onAssignCollection(
																		t.id,
																		null,
																	)
																}
															>
																None
															</DropdownMenuItem>
															{collections.map(
																(c) => (
																	<DropdownMenuItem
																		key={
																			c.id
																		}
																		onClick={() =>
																			onAssignCollection(
																				t.id,
																				c.id,
																			)
																		}
																	>
																		{c.name}
																	</DropdownMenuItem>
																),
															)}
														</DropdownMenuSubContent>
													</DropdownMenuSub>
													<DropdownMenuItem
														className="text-destructive"
														onClick={() =>
															setDeleteId(t.id)
														}
													>
														<Trash2 className="mr-2 h-4 w-4" />{" "}
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</CardContent>
									</Card>
								))}
						</div>
					)}
				</>
			)}

			{/* Edit name dialog */}
			<Dialog
				open={!!editTemplate}
				onOpenChange={(o) => !o && setEditTemplate(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Template</DialogTitle>
						<DialogDescription>
							Update the template name below.
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
							onClick={() => setEditTemplate(null)}
						>
							Cancel
						</Button>
						<Button onClick={saveEdit}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation */}
			<AlertDialog
				open={!!deleteId}
				onOpenChange={(o) => !o && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Template?</AlertDialogTitle>
						<AlertDialogDescription>
							This template will be moved to Trash. You can
							restore it later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteId) {
									onTrash(deleteId);
									setDeleteId(null);
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

export default TemplatesPage;
