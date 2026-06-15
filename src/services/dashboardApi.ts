import api from "@/services/axios";
import type { PaginationMeta } from "@/types/Pagination";
import { DEFAULT_PAGINATION } from "@/types/Pagination";
import type { Template } from "@/types/Template";
import type { Collection } from "@/hooks/useDashboardStore";

export const PAGE_SIZE = 10;

export interface TemplatesResponse {
	templates: Template[];
	pagination: PaginationMeta;
}

export interface CollectionsResponse {
	collections: Collection[];
	pagination: PaginationMeta;
}

export const fetchTemplates = async (
	baseUrl: string,
	params: {
		state?: "active" | "deleted";
		page?: number;
		pageSize?: number;
		collectionId?: number;
	},
): Promise<TemplatesResponse> => {
	const searchParams = new URLSearchParams({
		state: params.state ?? "active",
		page: String(params.page ?? 1),
		page_size: String(params.pageSize ?? PAGE_SIZE),
	});

	if (params.collectionId !== undefined) {
		searchParams.set("collection_id", String(params.collectionId));
	}

	const response = await api.get(
		`${baseUrl}/my-templates/?${searchParams.toString()}`,
	);

	return {
		templates: response.data.templates ?? [],
		pagination: response.data.pagination ?? DEFAULT_PAGINATION,
	};
};

export const fetchCollections = async (
	baseUrl: string,
	params: {
		page?: number;
		pageSize?: number;
		all?: boolean;
	},
): Promise<CollectionsResponse> => {
	const searchParams = new URLSearchParams({
		page: String(params.page ?? 1),
		page_size: String(params.pageSize ?? PAGE_SIZE),
	});

	if (params.all) {
		searchParams.set("all", "true");
	}

	const response = await api.get(
		`${baseUrl}/my-collections/?${searchParams.toString()}`,
	);

	return {
		collections: response.data.collections ?? [],
		pagination: response.data.pagination ?? DEFAULT_PAGINATION,
	};
};
