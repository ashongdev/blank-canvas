import api from "@/services/axios";
import { Template } from "@/types/Template";
import { useState, useCallback, SetStateAction, Dispatch } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./useAuthContext";

export interface Collection {
	id: number;
	name: string;
	created_at: string;
}

export function useDashboardStore({
	templates,
	setTemplates,
	collections,
	setCollections,
}: {
	templates: Template[];
	setTemplates: Dispatch<SetStateAction<Template[]>>;
	collections: Collection[];
	setCollections: Dispatch<SetStateAction<Collection[]>>;
}) {
	const { BASE_URL } = useAuthContext();
	// Templates
	const activeTemplates = templates.filter((t) => !t.trashed);
	const trashedTemplates = templates.filter((t) => t.trashed);

	const trashTemplate = useCallback(async (id: number) => {
		let previousTemplates: Template[] = [];

		setTemplates((prev) => {
			previousTemplates = prev;
			return prev.filter((t) => t.id !== id); // remove from UI immediately
		});

		try {
			await api.put(`${BASE_URL}/delete-template/?state=delete`, {
				templateId: id,
			});
		} catch (error) {
			setTemplates(previousTemplates); // rollback if server fails
			toast.error("Failed to delete template");
		}
	}, []);

	const restoreTemplate = useCallback(async (id: number) => {
		let previousTemplates: Template[] = [];

		setTemplates((prev) => {
			previousTemplates = prev;

			return prev.map((t) =>
				t.id === id ? { ...t, trashed: false } : t,
			);
		});

		try {
			await api.put(`${BASE_URL}/delete-template/?state=restore`, {
				templateId: id,
			});
		} catch (error) {
			setTemplates(previousTemplates); // rollback if server fails
			toast.error("Failed to delete template");
		}
	}, []);

	const permanentlyDelete = useCallback((id: number) => {
		setTemplates((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const updateTemplate = useCallback(
		async (id: number, updates: Partial<Template>) => {
			// save the old template in case we need to rollback
			const oldTemplate = templates.find((t) => t.id === id);

			setTemplates((prev) =>
				prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
			);

			try {
				await api.put(`${BASE_URL}/update-template/`, {
					templateId: id,
					...updates,
					isTemplate: false,
				});
			} catch (error) {
				// rollback if server fails
				if (oldTemplate) {
					setTemplates((prev) =>
						prev.map((t) => (t.id === id ? oldTemplate : t)),
					);
				}
				toast.error("Failed to update template");
			}
		},
		[templates],
	);

	const assignCollection = useCallback(
		async (templateId: number, collectionId: number | null) => {
			if (!templateId) return;

			const previousTemplates = templates;
			const oldTemplate = templates.find((t) => t.id === templateId);

			setTemplates((prev) =>
				prev.map((t) =>
					t.id === templateId
						? { ...t, collection_id: collectionId }
						: t,
				),
			);

			try {
				await api.put(`${BASE_URL}/add-to-collection/`, {
					templateId,
					collectionId,
				});
				toast.success("Success");
			} catch (error) {
				if (oldTemplate) {
					setTemplates((prev) =>
						prev.map((t) =>
							t.id === templateId ? oldTemplate : t,
						),
					);
				}
				toast.error("Failed to assign collection");
			}
		},
		[templates],
	);

	// Collections
	const createCollection = useCallback(
		async (name: string) => {
			const previousCollections = collections;
			const newCollection: Collection = {
				id: Date.now(),
				name,
				created_at: new Date().toISOString(),
			};

			setCollections((prev) => [...prev, newCollection]);

			try {
				const res = await api.put(`${BASE_URL}/create-collection/`, {
					name,
				});
				setCollections(res.data.collections);
				toast.success("Collection created successfully.");
			} catch (error) {
				setCollections(previousCollections);
				toast.error("Failed to create collection");
			}
		},
		[collections],
	);

	const updateCollection = useCallback(
		async (id: number, name: string) => {
			const oldCollection = collections.find((t) => t.id === id);

			setCollections((prev) =>
				prev.map((c) => (c.id === id ? { ...c, name } : c)),
			);

			try {
				await api.put(`${BASE_URL}/update-template/`, {
					collectionId: id,
					isTemplate: true,
					name,
				});
			} catch (error) {
				// rollback if server fails
				if (oldCollection) {
					setCollections((prev) =>
						prev.map((t) => (t.id === id ? oldCollection : t)),
					);
				}
				toast.error("Failed to update template");
			}
		},
		[collections],
	);

	const deleteCollection = useCallback(
		async (id: number) => {
			const previousTemplates = templates;
			const previousCollections = collections;

			setTemplates((prev) =>
				prev.map((t) =>
					t.collection_id === id ? { ...t, collection_id: null } : t,
				),
			);
			setCollections((prev) => prev.filter((c) => c.id !== id));

			try {
				await api.delete(
					`${BASE_URL}/delete-collection/?collectionId=${id}`,
				);
				toast.success("Collection deleted successfully.");
			} catch (error) {
				setTemplates(previousTemplates);
				setCollections(previousCollections);
				toast.error("Failed to delete collection");
			}
		},
		[templates, collections],
	);

	return {
		templates,
		activeTemplates,
		trashedTemplates,
		collections,
		trashTemplate,
		restoreTemplate,
		permanentlyDelete,
		updateTemplate,
		assignCollection,
		createCollection,
		updateCollection,
		deleteCollection,
	};
}
