import { useDashboardStore } from "@/hooks/useDashboardStore";
import { Routes, Route } from "react-router-dom";
import TemplatesPage from "./TemplatesPage";
import CollectionsPage from "./CollectionsPage";
import TrashPage from "./TrashPage";
import SettingsPage from "./SettingsPage";
import DashboardIndex from "./DashboardIndex";
import { Dispatch, FC, SetStateAction } from "react";
import { Template } from "@/types/Template";

interface Props {
	templates: Template[];
	setTemplates: Dispatch<SetStateAction<Template[]>>;
}

const DashboardRoutes: FC<Props> = ({ templates, setTemplates }) => {
	const store = useDashboardStore({ templates, setTemplates });

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
					/>
				}
			/>
			<Route path="settings" element={<SettingsPage />} />
		</Routes>
	);
};

export default DashboardRoutes;
