import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMeta } from "@/types/Pagination";

interface ListPaginationProps {
	pagination: PaginationMeta;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	className?: string;
}

const getVisiblePages = (
	currentPage: number,
	totalPages: number,
): (number | "ellipsis")[] => {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const pages: (number | "ellipsis")[] = [1];

	if (currentPage > 3) {
		pages.push("ellipsis");
	}

	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	for (let page = start; page <= end; page += 1) {
		pages.push(page);
	}

	if (currentPage < totalPages - 2) {
		pages.push("ellipsis");
	}

	if (totalPages > 1) {
		pages.push(totalPages);
	}

	return pages;
};

const ListPagination = ({
	pagination,
	onPageChange,
	isLoading = false,
	className,
}: ListPaginationProps) => {
	if (pagination.total_count === 0) {
		return null;
	}

	const visiblePages = getVisiblePages(
		pagination.page,
		pagination.total_pages,
	);
	const startItem =
		(pagination.page - 1) * pagination.page_size + 1;
	const endItem = Math.min(
		pagination.page * pagination.page_size,
		pagination.total_count,
	);

	return (
		<div
			className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
		>
			<p className="text-sm text-muted-foreground">
				Showing {startItem}–{endItem} of {pagination.total_count}
			</p>
			{pagination.total_pages > 1 && (
				<Pagination className="mx-0 w-auto justify-end">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								className={
									!pagination.has_previous || isLoading
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
								onClick={(event) => {
									event.preventDefault();
									if (
										pagination.has_previous &&
										!isLoading
									) {
										onPageChange(pagination.page - 1);
									}
								}}
							/>
						</PaginationItem>
						{visiblePages.map((page, index) =>
							page === "ellipsis" ? (
								<PaginationItem key={`ellipsis-${index}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={page}>
									<PaginationLink
										href="#"
										isActive={page === pagination.page}
										className={
											isLoading
												? "pointer-events-none opacity-50"
												: "cursor-pointer"
										}
										onClick={(event) => {
											event.preventDefault();
											if (
												!isLoading &&
												page !== pagination.page
											) {
												onPageChange(page);
											}
										}}
									>
										{page}
									</PaginationLink>
								</PaginationItem>
							),
						)}
						<PaginationItem>
							<PaginationNext
								href="#"
								className={
									!pagination.has_next || isLoading
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
								onClick={(event) => {
									event.preventDefault();
									if (pagination.has_next && !isLoading) {
										onPageChange(pagination.page + 1);
									}
								}}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

export default ListPagination;
