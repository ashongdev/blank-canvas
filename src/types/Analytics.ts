export interface DailyPoint {
	date: string;
	count: number;
}

export interface TopTemplate {
	id: number;
	name: string;
	public_id: string;
	url: string;
	generation_count: number;
}

export interface RecentActivityItem {
	template_name: string;
	template_id: number;
	kind: "self_serve" | "batch";
	count: number;
	created_at: string;
}

export interface Analytics {
	total_generated: number;
	by_kind: {
		self_serve: number;
		batch: number;
	};
	daily: DailyPoint[];
	top_templates: TopTemplate[];
	recipients_invited: number;
	gated_templates: number;
	codes_requested: number;
	codes_verified: number;
	recent_activity: RecentActivityItem[];
}
