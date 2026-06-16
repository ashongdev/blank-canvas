import api from "@/services/axios";
import { PAGE_SIZE } from "@/services/dashboardApi";
import type { Collection } from "@/types/Collection";
import type { Template } from "@/types/Template";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./useAuthContext";

export type { Collection };

export function useDashboardStore({
	templates,
	setTemplates,
	collections,
	setCollections,
}: {
	templates: Template[];
	setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
	collections: Collection[];
	setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}) {
	const { BASE_URL } = useAuthContext();

	// ─── Templates ──────────────────────────────────────────────────────────

	const trashTemplate = useCallback(
		async (id: number) => {
			const snapshot = templates;
			setTemplates((prev) => prev.filter((t) => t.id !== id));
			try {
				await api.put(`${BASE_URL}/templates/state/?state=delete`, {
					templateId: id,
				});
			} catch {
				setTemplates(snapshot);
				toast.error("Failed to delete template");
			}
		},
		[templates, setTemplates, BASE_URL],
	);

	const restoreTemplate = useCallback(
		async (id: number) => {
			const snapshot = templates;
			setTemplates((prev) =>
				prev.map((t) => (t.id === id ? { ...t, trashed: false, state: "active" } : t)),
			);
			try {
				await api.put(`${BASE_URL}/templates/state/?state=restore`, {
					templateId: id,
				});
			} catch {
				setTemplates(snapshot);
				toast.error("Failed to restore template");
			}
		},
		[templates, setTemplates, BASE_URL],
	);

	const permanentlyDelete = useCallback(
		(id: number) => {
			setTemplates((prev) => prev.filter((t) => t.id !== id));
		},
		[setTemplates],
	);

	const updateTemplate = useCallback(
		async (id: number, updates: Partial<Template>) => {
			const snapshot = templates;
			setTemplates((prev) =>
				prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
			);
			try {
				await api.put(`${BASE_URL}/templates/rename/`, {
					templateId: id,
					name: updates.name,
				});
			} catch {
				setTemplates(snapshot);
				toast.error("Failed to update template");
			}
		},
		[templates, setTemplates, BASE_URL],
	);

	const assignCollection = useCallback(
		async (templateId: number, collectionId: number | null) => {
			if (!templateId) return;
			const snapshot = templates;
			setTemplates((prev) =>
				prev.map((t) =>
					t.id === templateId ? { ...t, collection_id: collectionId } : t,
				),
			);
			try {
				await api.put(`${BASE_URL}/templates/assign-collection/`, {
					templateId,
					collectionId,
				});
				toast.success("Collection updated");
			} catch {
				setTemplates(snapshot);
				toast.error("Failed to assign collection");
			}
		},
		[templates, setTemplates, BASE_URL],
	);

	// ─── Collections ────────────────────────────────────────────────────────

	const createCollection = useCallback(
		async (name: string) => {
			const snapshot = collections;
			const optimistic: Collection = {
				id: Date.now(),
				name,
				created_at: new Date().toISOString(),
			};
			setCollections((prev) => [...prev, optimistic]);
			try {
				const res = await api.post(`${BASE_URL}/collections/create/`, { name });
				const created = res.data.collection as Collection;
				setCollections((prev) => [
					created,
					...prev.filter((c) => c.id !== optimistic.id),
				]);
				toast.success("Collection created");
			} catch {
				setCollections(snapshot);
				toast.error("Failed to create collection");
			}
		},
		[collections, setCollections, BASE_URL],
	);

	const updateCollection = useCallback(
		async (id: number, name: string) => {
			const snapshot = collections;
			setCollections((prev) =>
				prev.map((c) => (c.id === id ? { ...c, name } : c)),
			);
			try {
				await api.put(`${BASE_URL}/collections/rename/`, {
					collectionId: id,
					name,
				});
			} catch {
				setCollections(snapshot);
				toast.error("Failed to rename collection");
			}
		},
		[collections, setCollections, BASE_URL],
	);

	const deleteCollection = useCallback(
		async (id: number) => {
			const templateSnapshot = templates;
			const collectionSnapshot = collections;
			setTemplates((prev) =>
				prev.map((t) =>
					t.collection_id === id ? { ...t, collection_id: null } : t,
				),
			);
			setCollections((prev) => prev.filter((c) => c.id !== id));
			try {
				await api.delete(`${BASE_URL}/collections/delete/?collectionId=${id}`);
				toast.success("Collection deleted");
			} catch {
				setTemplates(templateSnapshot);
				setCollections(collectionSnapshot);
				toast.error("Failed to delete collection");
			}
		},
		[templates, collections, setTemplates, setCollections, BASE_URL],
	);

	const uploadTemplateToCollection = useCallback(
		async (collectionId: number | null, file: File): Promise<string | null> => {
			const formData = new FormData();
			formData.append("template", file);
			try {
				const uploadRes = await api.post(`${BASE_URL}/upload/`, formData);
				const uploadedPublicId = uploadRes.data?.public_id as string | undefined;
				if (!uploadedPublicId) {
					toast.error("Template uploaded but public_id was not returned.");
					return null;
				}
				if (collectionId !== null) {
					const fetchRes = await api.get(
						`${BASE_URL}/templates/?state=active&page=1&page_size=${PAGE_SIZE}`,
					);
					const fetched: Template[] = fetchRes.data.templates ?? [];
					const uploaded = fetched.find((t) => t.public_id === uploadedPublicId);
					if (uploaded) {
						await api.put(`${BASE_URL}/templates/assign-collection/`, {
							templateId: uploaded.id,
							collectionId,
						});
					}
				}
				toast.success(
					collectionId === null
						? "Template uploaded"
						: "Template uploaded to collection",
				);
				return uploadedPublicId;
			} catch {
				toast.error("Failed to upload template");
				return null;
			}
		},
		[BASE_URL],
	);

	return {
		templates,
		collections,
		trashTemplate,
		restoreTemplate,
		permanentlyDelete,
		updateTemplate,
		assignCollection,
		uploadTemplateToCollection,
		createCollection,
		updateCollection,
		deleteCollection,
	};
}
