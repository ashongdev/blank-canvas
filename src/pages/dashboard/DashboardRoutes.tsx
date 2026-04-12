import { useDashboardStore } from "@/hooks/useDashboardStore";
import { Routes, Route, useLocation } from "react-router-dom";
import TemplatesPage from "./TemplatesPage";
import CollectionsPage from "./CollectionsPage";
import TrashPage from "./TrashPage";
import SettingsPage from "./SettingsPage";
import DashboardIndex from "./DashboardIndex";
import { useCallback, useEffect, useState } from "react";
import { Template } from "@/types/Template";
import api from "@/services/axios";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";

export interface Collection {
	id: number;
	name: string;
	created_at: string;
}

const DashboardRoutes = () => {
	const [templates, setTemplates] = useState<Template[]>([]);
	const [collections, setCollections] = useState<Collection[]>([]);

	const [isActiveLoading, setIsActiveLoading] = useState(false);
	const [isDeletedLoading, setIsDeletedLoading] = useState(false);
	const store = useDashboardStore({
		templates,
		setTemplates,
		collections,
		setCollections,
	});
	const { BASE_URL } = useAuthContext();
	const location = useLocation();

	const fetchMyTemplates = useCallback(
		async (state: "active" | "deleted") => {
			if (state === "active") {
				setIsActiveLoading(true);
			} else {
				setIsDeletedLoading(true);
			}

			try {
				const response = await api.get(
					`${BASE_URL}/my-templates?state=${state}`,
				);
				setTemplates(response.data.templates);
				setCollections(response.data.collections);
			} catch (error) {
				toast.error("Error fetching templates.");
			} finally {
				if (state === "active") {
					setIsActiveLoading(false);
				} else {
					setIsDeletedLoading(false);
				}
			}
		},
		[BASE_URL],
	);

	useEffect(() => {
		if (
			location.pathname === "/dashboard/templates" ||
			location.pathname === "/dashboard/collections"
		) {
			void fetchMyTemplates("active");
		}

		if (location.pathname === "/dashboard/trash") {
			void fetchMyTemplates("deleted");
		}
	}, [fetchMyTemplates, location.pathname]);

	return (
		<Routes>
			<Route index element={<DashboardIndex />} />
			<Route
				path="templates"
				element={
					<TemplatesPage
						templates={templates}
						isLoading={isActiveLoading}
						collections={collections}
						onTrash={store.trashTemplate}
						onUpdate={store.updateTemplate}
						onAssignCollection={store.assignCollection}
					/>
				}
			/>
			<Route
				path="collections"
				element={
					<CollectionsPage
						isLoading={isActiveLoading}
						collections={collections}
						templates={store.templates}
						onCreate={store.createCollection}
						onUpdate={store.updateCollection}
						onDelete={store.deleteCollection}
						onAssignCollection={store.assignCollection}
						onUploadToCollection={
							store.uploadTemplateToCollection
						}
					/>
				}
			/>
			<Route
				path="trash"
				element={
					<TrashPage
						templates={store.trashedTemplates}
						isLoading={isDeletedLoading}
						onRestore={store.restoreTemplate}
						onPermanentlyDelete={store.permanentlyDelete}
					/>
				}
			/>
			<Route path="settings" element={<SettingsPage />} />
		</Routes>
	);
};

export default DashboardRoutes;
