import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/hooks/useAuthContext";
import { fetchAnalytics } from "@/services/dashboardApi";
import type { Analytics } from "@/types/Analytics";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Mail, Package, Send, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const AnalyticsPage = () => {
	const { BASE_URL } = useAuthContext();
	const [data, setData] = useState<Analytics | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setIsLoading(true);
			try {
				const result = await fetchAnalytics(BASE_URL);
				if (!cancelled) setData(result);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, [BASE_URL]);

	const verificationRate =
		data && data.codes_requested > 0
			? Math.round((data.codes_verified / data.codes_requested) * 100)
			: null;

	const chartData =
		data?.daily.map((d) => ({
			...d,
			label: format(parseISO(d.date), "MMM d"),
		})) ?? [];

	const statCards = [
		{
			label: "Total Generated",
			value: data?.total_generated ?? 0,
			icon: Send,
			caption: "certificates issued, all-time",
		},
		{
			label: "Self-Serve",
			value: data?.by_kind.self_serve ?? 0,
			icon: Users,
			caption: "via shared links",
		},
		{
			label: "Batch",
			value: data?.by_kind.batch ?? 0,
			icon: Package,
			caption: "via organizer bulk runs",
		},
		{
			label: "Recipients Invited",
			value: data?.recipients_invited ?? 0,
			icon: Mail,
			caption: `${data?.gated_templates ?? 0} gated template${
				(data?.gated_templates ?? 0) === 1 ? "" : "s"
			}`,
		},
		{
			label: "Verification Rate",
			value: verificationRate !== null ? `${verificationRate}%` : "—",
			icon: ShieldCheck,
			caption:
				data && data.codes_requested > 0
					? `${data.codes_verified}/${data.codes_requested} codes verified`
					: "no verification requests yet",
		},
	];

	return (
		<div className="space-y-12">
			{/* Byline header */}
			<div className="relative">
				<span
					aria-hidden
					className="pointer-events-none absolute -left-2 -top-12 select-none font-playfair text-[7rem] font-bold italic leading-none text-foreground/[0.04] sm:text-[9rem]"
				>
					03
				</span>
				<div className="relative border-b-2 border-foreground pb-4">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
						Section 03
					</p>
					<h2 className="mt-1 font-playfair text-3xl italic text-foreground sm:text-4xl">
						Analytics
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						How your certificates are actually being used.
					</p>
				</div>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				{statCards.map((card) => (
					<div key={card.label} className="border border-border bg-card p-4">
						<card.icon className="h-4 w-4 text-secondary" />
						{isLoading ? (
							<Skeleton className="mt-3 h-7 w-14" />
						) : (
							<p className="mt-3 font-playfair text-2xl font-bold italic text-foreground">
								{card.value}
							</p>
						)}
						<p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							{card.label}
						</p>
						<p className="mt-0.5 text-[11px] text-muted-foreground/80">
							{card.caption}
						</p>
					</div>
				))}
			</div>

			{/* Trend chart */}
			<div className="border border-border bg-card p-5">
				<h3 className="font-playfair text-lg italic text-foreground">
					Last 30 days
				</h3>
				{isLoading ? (
					<Skeleton className="mt-4 h-56 w-full" />
				) : (
					<div className="mt-4 h-56 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={chartData}
								margin={{ left: -20, right: 10, top: 10 }}
							>
								<defs>
									<linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="0%"
											stopColor="hsl(var(--primary))"
											stopOpacity={0.35}
										/>
										<stop
											offset="100%"
											stopColor="hsl(var(--primary))"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(var(--border))"
									vertical={false}
								/>
								<XAxis
									dataKey="label"
									tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
									tickLine={false}
									axisLine={false}
									interval={4}
								/>
								<YAxis
									allowDecimals={false}
									tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
									tickLine={false}
									axisLine={false}
									width={30}
								/>
								<Tooltip
									contentStyle={{
										background: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: 0,
										fontSize: 12,
									}}
									labelStyle={{ color: "hsl(var(--foreground))" }}
								/>
								<Area
									type="monotone"
									dataKey="count"
									stroke="hsl(var(--primary))"
									strokeWidth={2}
									fill="url(#trendFill)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				)}
			</div>

			{/* Top templates + recent activity */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div>
					<h3 className="border-b-2 border-foreground pb-2 font-playfair text-lg italic text-foreground">
						Top templates
					</h3>
					{isLoading ? (
						<div className="mt-4 space-y-3">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-12 w-full" />
							))}
						</div>
					) : data && data.top_templates.length > 0 ? (
						<div className="mt-2 divide-y divide-dashed divide-border">
							{data.top_templates.map((t, i) => (
								<div key={t.id} className="flex items-center gap-3 py-3">
									<span className="w-6 shrink-0 font-playfair text-sm italic text-muted-foreground">
										{String(i + 1).padStart(2, "0")}
									</span>
									<div className="h-10 w-14 shrink-0 overflow-hidden bg-muted">
										<img
											src={t.url}
											alt={t.name}
											className="h-full w-full object-cover"
										/>
									</div>
									<p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
										{t.name}
									</p>
									<span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
										<Send className="h-3 w-3" />
										{t.generation_count}
									</span>
								</div>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-muted-foreground">
							Nothing generated yet — once certificates start going out,
							your most-used templates will show up here.
						</p>
					)}
				</div>

				<div>
					<h3 className="border-b-2 border-foreground pb-2 font-playfair text-lg italic text-foreground">
						Recent activity
					</h3>
					{isLoading ? (
						<div className="mt-4 space-y-3">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : data && data.recent_activity.length > 0 ? (
						<div className="mt-2 divide-y divide-dashed divide-border">
							{data.recent_activity.map((item, i) => (
								<div key={i} className="py-3 text-sm">
									<p className="text-foreground">
										{item.count} certificate
										{item.count !== 1 ? "s" : ""} generated for{" "}
										<span className="font-medium">
											{item.template_name}
										</span>
										{item.kind === "batch" ? " (batch)" : ""}
									</p>
									<p className="mt-0.5 text-xs text-muted-foreground">
										{formatDistanceToNow(parseISO(item.created_at), {
											addSuffix: true,
										})}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-muted-foreground">
							No activity yet.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
