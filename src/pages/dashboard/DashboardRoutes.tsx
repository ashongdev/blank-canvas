import { useDashboardStore } from "@/hooks/useDashboardStore";
import { Routes, Route } from "react-router-dom";
import TemplatesPage from "./TemplatesPage";
import CollectionsPage from "./CollectionsPage";
import TrashPage from "./TrashPage";
import SettingsPage from "./SettingsPage";
import DashboardIndex from "./DashboardIndex";
import { Dispatch, FC, SetStateAction } from "react";
import { Template } from "@/types/Template";
import api from "@/services/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DashboardRoutes = () => {
	const [templates, setTemplates] = useState<Template[]>([]);
	const store = useDashboardStore({ templates, setTemplates });
	const BASE_URL = import.meta.env.VITE_BASE_URL;

	const fetchMyTemplates = async (state: "active" | "deleted") => {
		try {
			const response = await api.get(
				`${BASE_URL}/my-templates?state=${state}`,
			);
			setTemplates(response.data.templates);
		} catch (error) {
			toast.error("Error fetching templates.");
		}
	};

	return (
		<Routes>
			<Route index element={<DashboardIndex />} />
			<Route
				path="templates"
				element={
					<TemplatesPage
						templates={templates}
						collections={store.collections}
						onTrash={store.trashTemplate}
						onUpdate={store.updateTemplate}
						onAssignCollection={store.assignCollection}
						fetchMyTemplates={fetchMyTemplates}
					/>
				}
			/>
			<Route
				path="collections"
				element={
					<CollectionsPage
						collections={store.collections}
						templates={store.templates}
						onCreate={store.createCollection}
						onUpdate={store.updateCollection}
						onDelete={store.deleteCollection}
						onAssignCollection={store.assignCollection}
					/>
				}
			/>
			<Route
				path="trash"
				element={
					<TrashPage
						templates={store.trashedTemplates}
						onRestore={store.restoreTemplate}
						onPermanentlyDelete={store.permanentlyDelete}
						fetchMyTemplates={fetchMyTemplates}
					/>
				}
			/>
			<Route path="settings" element={<SettingsPage />} />
		</Routes>
	);
};

export default DashboardRoutes;
