import api from "@/services/axios";
import { Template } from "@/types/Template";
import { useState, useCallback, SetStateAction, Dispatch } from "react";
import { toast } from "sonner";

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
	const BASE_URL = import.meta.env.VITE_BASE_URL;

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
		(templateId: number, collection_id: number | null) => {
			setTemplates((prev) =>
				prev.map((t) =>
					t.id === templateId ? { ...t, collection_id } : t,
				),
			);
		},
		[],
	);

	// Collections
	const createCollection = useCallback(async (name: string) => {
		const newCol: Collection = {
			id: Date.now(),
			name,
			created_at: new Date().toISOString(),
		};
		setCollections((prev) => [...prev, newCol]);

		try {
			await api.put(`${BASE_URL}/create-collection/`, { name: name });
			toast.success("Collection created successfully.");
		} catch (error) {
			toast.error("Failed to add new collection");
		}
		return newCol;
	}, []);

	const updateCollection = useCallback((id: number, name: string) => {
		setCollections((prev) =>
			prev.map((c) => (c.id === id ? { ...c, name } : c)),
		);
	}, []);

	const deleteCollection = useCallback((id: number) => {
		// Unassign templates but don't trash them
		setTemplates((prev) =>
			prev.map((t) =>
				t.collection_id === id ? { ...t, collection_id: null } : t,
			),
		);
		setCollections((prev) => prev.filter((c) => c.id !== id));
	}, []);

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
