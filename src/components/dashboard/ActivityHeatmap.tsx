import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActivityDailyPoint } from "@/types/Analytics";
import { format, getDay, parseISO } from "date-fns";

interface Props {
	data: ActivityDailyPoint[];
}

const HEAT_LEVEL_CLASSES = [
	"bg-muted",
	"bg-primary/25",
	"bg-primary/50",
	"bg-primary/75",
	"bg-primary",
];

const DAY_ROW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const getTotal = (d: ActivityDailyPoint) =>
	d.templates_created + d.links_shared + d.templates_loaded;

const getHeatLevel = (count: number, max: number) => {
	if (count === 0) return 0;
	const ratio = count / max;
	if (ratio > 0.75) return 4;
	if (ratio > 0.5) return 3;
	if (ratio > 0.25) return 2;
	return 1;
};

const ActivityHeatmap = ({ data }: Props) => {
	if (data.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No activity yet.</p>
		);
	}

	const maxDaily = Math.max(1, ...data.map(getTotal));

	// Left-pad so the first real day lands in its correct day-of-week row,
	// matching a real calendar grid (columns = weeks, rows = Sun..Sat).
	const leadingEmpty = getDay(parseISO(data[0].date));
	const cells: (ActivityDailyPoint | null)[] = [
		...Array.from({ length: leadingEmpty }, () => null),
		...data,
	];

	const weeks: (ActivityDailyPoint | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7));
	}

	let lastMonth = -1;
	const monthLabels = weeks.map((week) => {
		const firstDay = week.find((c) => c !== null);
		if (!firstDay) return "";
		const month = parseISO(firstDay.date).getMonth();
		if (month === lastMonth) return "";
		lastMonth = month;
		return format(parseISO(firstDay.date), "MMM");
	});

	return (
		<TooltipProvider delayDuration={100}>
			<div className="flex items-start gap-2 overflow-x-auto pb-1">
				<div className="flex shrink-0 flex-col gap-[3px] pt-[18px]">
					{DAY_ROW_LABELS.map((label, i) => (
						<span
							key={i}
							className="flex h-[13px] items-center text-[9px] leading-none text-muted-foreground"
						>
							{label}
						</span>
					))}
				</div>
				<div className="flex gap-[3px]">
					{weeks.map((week, weekIndex) => (
						<div key={weekIndex} className="flex flex-col gap-[3px]">
							<span className="block h-[14px] text-[9px] leading-none text-muted-foreground">
								{monthLabels[weekIndex]}
							</span>
							{week.map((day, dayIndex) =>
								day ? (
									<Tooltip key={dayIndex}>
										<TooltipTrigger asChild>
											<div
												className={cn(
													"h-[13px] w-[13px] cursor-default",
													HEAT_LEVEL_CLASSES[
														getHeatLevel(getTotal(day), maxDaily)
													],
												)}
											/>
										</TooltipTrigger>
										<TooltipContent className="text-xs">
											<p className="font-medium">
												{format(parseISO(day.date), "MMM d, yyyy")}
											</p>
											<p className="text-muted-foreground">
												{getTotal(day)} action
												{getTotal(day) !== 1 ? "s" : ""} —{" "}
												{day.templates_created} created,{" "}
												{day.links_shared} shared,{" "}
												{day.templates_loaded} loaded
											</p>
										</TooltipContent>
									</Tooltip>
								) : (
									<div key={dayIndex} className="h-[13px] w-[13px]" />
								),
							)}
						</div>
					))}
				</div>
			</div>
			<div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
				<span>Less</span>
				{HEAT_LEVEL_CLASSES.map((cls, i) => (
					<span key={i} className={cn("h-[11px] w-[11px]", cls)} />
				))}
				<span>More</span>
			</div>
		</TooltipProvider>
	);
};

export default ActivityHeatmap;
