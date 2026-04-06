import api from "@/services/axios";
import { Template } from "@/types/Template";
import { useState, useCallback, SetStateAction, Dispatch } from "react";
import { toast } from "sonner";

export interface Collection {
	id: number;
	name: string;
	created_at: string;
}

const SEED_COLLECTIONS: Collection[] = [
	{
		id: 1,
		name: "Events",
		created_at: new Date("2025-12-01").toDateString(),
	},
	{
		id: 2,
		name: "Corporate",
		created_at: new Date("2025-12-10").toDateString(),
	},
];

const SEED_TEMPLATES: Template[] = [
	{
		id: 1,
		name: "Award Certificate",
		url: "/placeholder.svg",
		public_id: "cert_award_001",
		created_at: new Date("2026-01-15").toDateString(),
		collection_id: 1,
		trashed: false,
		updated_at: new Date("2026-03-10").toDateString(),
		user: null,
	},
	{
		id: 2,
		name: "Workshop Completion",
		url: "/placeholder.svg",
		public_id: "cert_workshop_002",
		created_at: new Date("2026-02-01").toDateString(),
		collection_id: 1,
		trashed: false,
		updated_at: new Date("2026-03-10").toDateString(),
		user: null,
	},
	{
		id: 3,
		name: "Employee of the Month",
		url: "/placeholder.svg",
		public_id: "cert_eom_003",
		created_at: new Date("2026-02-20").toDateString(),
		collection_id: 2,
		trashed: false,
		updated_at: new Date("2026-03-10").toDateString(),
		user: null,
	},
	{
		id: 4,
		name: "Training Badge",
		url: "/placeholder.svg",
		public_id: "cert_badge_004",
		created_at: new Date("2026-03-05").toDateString(),
		collection_id: null,
		trashed: false,
		updated_at: new Date("2026-03-10").toDateString(),
		user: null,
	},
	{
		id: 5,
		name: "Volunteer Appreciation",
		url: "/placeholder.svg",
		public_id: "cert_vol_005",
		created_at: new Date("2026-03-12").toDateString(),
		collection_id: null,
		trashed: false,
		updated_at: new Date("2026-03-10").toDateString(),
		user: null,
	},
];

export function useDashboardStore({
	templates,
	setTemplates,
}: {
	templates: Template[];
	setTemplates: Dispatch<SetStateAction<Template[]>>;
}) {
	const BASE_URL = import.meta.env.VITE_BASE_URL;

	// const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES);
	const [collections, setCollections] =
		useState<Collection[]>(SEED_COLLECTIONS);

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
			await api.put(`${BASE_URL}/delete-template/`, {
				templateId: id,
			});
		} catch (error) {
			setTemplates(previousTemplates); // rollback if server fails
			toast.error("Failed to delete template");
		}
	}, []);

	const restoreTemplate = useCallback((id: number) => {
		setTemplates((prev) =>
			prev.map((t) => (t.id === id ? { ...t, trashed: false } : t)),
		);
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
	const createCollection = useCallback((name: string) => {
		const newCol: Collection = {
			id: Date.now(),
			name,
			created_at: new Date().toISOString(),
		};
		setCollections((prev) => [...prev, newCol]);
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
