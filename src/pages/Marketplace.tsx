import CertificatePreview from "@/components/CertificatePreview";
import Header from "@/components/Header";
import EditorAuthFooter from "@/components/EditorAuthFooter";
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
import { Input } from "@/components/ui/input";
import {
	MARKETPLACE_CATEGORIES,
	marketplaceTemplates,
} from "@/config/marketplaceTemplates";
import { openMarketplaceTemplateInEditor } from "@/lib/editorUtils";
import type {
	MarketplaceCategory,
	MarketplaceTemplate,
} from "@/types/MarketplaceTemplate";
import { AnimatePresence, motion } from "framer-motion";
import {
	Eye,
	FlaskConical,
	Search,
	Sparkles,
	Store,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] =
		useState<MarketplaceCategory>("all");
	const [previewTemplate, setPreviewTemplate] =
		useState<MarketplaceTemplate | null>(null);

	const previewRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	const filteredTemplates = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return marketplaceTemplates.filter((template) => {
			const matchesCategory =
				activeCategory === "all" ||
				template.category === activeCategory;
			const matchesSearch =
				!query ||
				template.name.toLowerCase().includes(query) ||
				template.description.toLowerCase().includes(query) ||
				template.tags.some((tag) => tag.toLowerCase().includes(query));

			return matchesCategory && matchesSearch;
		});
	}, [activeCategory, searchQuery]);

	const handleUseTemplate = (mode: "testing" | "actual") => {
		if (!previewTemplate) return;
		openMarketplaceTemplateInEditor(navigate, previewTemplate, mode);
		setPreviewTemplate(null);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header onTourClick={() => {}} />

			<main className="flex-1 container mx-auto px-6 py-10">
				<div className="max-w-6xl mx-auto space-y-8">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Store className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h1 className="text-3xl font-semibold tracking-tight">
									Template Marketplace
								</h1>
								<p className="text-muted-foreground">
									Browse ready-made certificate templates.
									Preview any design, then choose to try it
									with sample data or use it for real.
								</p>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="relative w-full sm:max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search templates..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{MARKETPLACE_CATEGORIES.map((category) => (
								<Button
									key={category.id}
									variant={
										activeCategory === category.id
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() =>
										setActiveCategory(category.id)
									}
								>
									{category.label}
								</Button>
							))}
						</div>
					</div>

					{filteredTemplates.length === 0 ? (
						<div className="text-center py-20 text-muted-foreground">
							<p>No templates match your search.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence mode="popLayout">
								{filteredTemplates.map((template, index) => (
									<motion.div
										key={template.id}
										layout
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{
											duration: 0.25,
											delay: index * 0.04,
										}}
									>
										<Card className="group overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
											<CardContent className="p-0">
												<button
													type="button"
													className="w-full text-left"
													onClick={() =>
														setPreviewTemplate(
															template,
														)
													}
												>
													<div className="relative aspect-[1.414/1] bg-muted overflow-hidden">
														<img
															src={
																template.imageUrl
															}
															alt={template.name}
															className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
														/>
														<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
															<span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
																<Eye className="h-4 w-4" />
																Preview
															</span>
														</div>
													</div>
													<div className="p-4 space-y-2">
														<div className="flex items-start justify-between gap-2">
															<h3 className="font-medium">
																{template.name}
															</h3>
															<Badge
																variant="secondary"
																className="capitalize shrink-0"
															>
																{
																	template.category
																}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground line-clamp-2">
															{
																template.description
															}
														</p>
														<div className="flex flex-wrap gap-1 pt-1">
															{template.tags.map(
																(tag) => (
																	<Badge
																		key={
																			tag
																		}
																		variant="outline"
																		className="text-xs font-normal"
																	>
																		{tag}
																	</Badge>
																),
															)}
														</div>
													</div>
												</button>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>
			</main>

			<Dialog
				open={previewTemplate !== null}
				onOpenChange={(open) => {
					if (!open) setPreviewTemplate(null);
				}}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					{previewTemplate && (
						<>
							<DialogHeader>
								<DialogTitle>{previewTemplate.name}</DialogTitle>
								<DialogDescription>
									{previewTemplate.description}
								</DialogDescription>
							</DialogHeader>

							<div className="py-4">
								<div className="h-[340px] sm:h-[420px]">
									<CertificatePreview
										templateUrl={previewTemplate.imageUrl}
										fields={previewTemplate.fields}
										selectedFieldId={
											previewTemplate.fields[0]?.id ??
											"field-1"
										}
										onFieldSelect={() => {}}
										showPreview={true}
										previewRef={previewRef}
										imgRef={imgRef}
									/>
								</div>
							</div>

							<div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
								<p className="text-sm font-medium">
									How would you like to use this template?
								</p>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li className="flex items-center gap-2">
										<FlaskConical className="h-4 w-4 shrink-0" />
										<span>
											<strong className="text-foreground">
												Try with sample data
											</strong>{" "}
											— opens the editor with placeholder
											text and sample recipients for
											testing.
										</span>
									</li>
									<li className="flex items-center gap-2">
										<Sparkles className="h-4 w-4 shrink-0" />
										<span>
											<strong className="text-foreground">
												Use template
											</strong>{" "}
											— opens a clean editor ready for
											your real certificate content.
										</span>
									</li>
								</ul>
							</div>

							<DialogFooter className="flex-col sm:flex-row gap-2">
								<Button
									variant="outline"
									onClick={() => setPreviewTemplate(null)}
								>
									Cancel
								</Button>
								<Button
									variant="secondary"
									className="gap-2"
									onClick={() => handleUseTemplate("testing")}
								>
									<FlaskConical className="h-4 w-4" />
									Try with sample data
								</Button>
								<Button
									className="gap-2"
									onClick={() => handleUseTemplate("actual")}
								>
									<Sparkles className="h-4 w-4" />
									Use template
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			<EditorAuthFooter />
		</div>
	);
};

export default Marketplace;
