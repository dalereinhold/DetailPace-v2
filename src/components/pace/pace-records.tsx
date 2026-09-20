import {
	Check,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	FileEdit,
	Filter,
	RefreshCw,
	RotateCcw,
	Search,
	SlidersHorizontal,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VehicleInspectionSheet from "@/components/pace/vehicle-inspection-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	CONDITION_COLORS,
	FALLBACK_BADGE_COLOR,
	SERVICE_TYPE_COLORS,
	TYPE_COLORS,
} from "@/lib/pace/colors";
import {
	computeLiveSeconds,
	type DisplayStatus,
	formatDuration,
	formatShortDate,
	getDisplayStatus,
	isPending,
	STATUS_ORDER,
} from "@/lib/pace/vehicle";
import {
	supabase,
	type Vehicle,
	type VehicleCondition,
	type VehicleServiceType,
	type VehicleType,
} from "@/lib/supabase";

interface PaceRecordsProps {
	refreshTrigger: number;
	onVehicleSelect?: (vehicle: Vehicle) => void;
	onRefresh?: () => void;
	onAddVehicleClick?: () => void;
}

type SortField =
	| "license_plate"
	| "created_at"
	| "net_work_seconds"
	| "status"
	| "type";
type SortDirection = "asc" | "desc";

const ROWS_PER_PAGE = 12;

function getPageNumbers(
	currentPage: number,
	totalPages: number,
): (number | "ellipsis")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}
	if (currentPage <= 4) {
		return [1, 2, 3, 4, 5, "ellipsis", totalPages];
	}
	if (currentPage >= totalPages - 3) {
		return [
			1,
			"ellipsis",
			totalPages - 4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}
	return [
		1,
		"ellipsis",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"ellipsis",
		totalPages,
	];
}

export default function PaceRecords({
	refreshTrigger,
	onVehicleSelect,
	onRefresh,
}: PaceRecordsProps) {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<DisplayStatus | "All">(
		"All",
	);
	const [typeFilter, setTypeFilter] = useState<VehicleType | "All">("All");
	const [conditionFilter, setConditionFilter] = useState<
		VehicleCondition | "All"
	>("All");
	const [serviceTypeFilter, setServiceTypeFilter] = useState<
		VehicleServiceType | "All"
	>("All");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterMenuRef = useRef<HTMLDivElement>(null);

	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const fetchVehicles = useCallback(async () => {
		setError(null);
		const { data, error: dbError } = await supabase
			.from("vehicles")
			.select("*")
			.order("created_at", { ascending: false });

		if (dbError) {
			setError(dbError.message);
		} else {
			setVehicles((data as Vehicle[]) ?? []);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		setLoading(true);
		fetchVehicles();
	}, [fetchVehicles, refreshTrigger]);

	// Close filter menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				filterMenuRef.current &&
				!filterMenuRef.current.contains(event.target as Node)
			) {
				setIsFilterOpen(false);
			}
		}
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsFilterOpen(false);
			}
		}
		if (isFilterOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFilterOpen]);

	const handleDelete = async (e: React.MouseEvent, vehicle: Vehicle) => {
		e.stopPropagation();
		if (
			!confirm(
				`Are you sure you want to delete vehicle ${vehicle.license_plate}?`,
			)
		) {
			return;
		}

		setDeletingId(vehicle.id);
		const { error: delError } = await supabase
			.from("vehicles")
			.delete()
			.eq("id", vehicle.id);
		setDeletingId(null);

		if (delError) {
			alert(`Failed to delete: ${delError.message}`);
		} else {
			if (selectedVehicle?.id === vehicle.id) {
				setSelectedVehicle(null);
			}
			fetchVehicles();
			onRefresh?.();
		}
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (statusFilter !== "All") count++;
		if (typeFilter !== "All") count++;
		if (conditionFilter !== "All") count++;
		if (serviceTypeFilter !== "All") count++;
		return count;
	}, [statusFilter, typeFilter, conditionFilter, serviceTypeFilter]);

	const clearAllFilters = () => {
		setStatusFilter("All");
		setTypeFilter("All");
		setConditionFilter("All");
		setServiceTypeFilter("All");
		setSearch("");
	};

	// Filter & Search
	const filtered = useMemo(() => {
		const term = search.toLowerCase().trim();
		return vehicles.filter((v) => {
			const matchesSearch =
				!term ||
				v.license_plate.toLowerCase().includes(term) ||
				v.type.toLowerCase().includes(term) ||
				v.service_type.toLowerCase().includes(term) ||
				v.condition.toLowerCase().includes(term) ||
				(v.notes && v.notes.toLowerCase().includes(term));

			const displayStatus = getDisplayStatus(v);
			const matchesStatus =
				statusFilter === "All" || displayStatus === statusFilter;
			const matchesType = typeFilter === "All" || v.type === typeFilter;
			const matchesCondition =
				conditionFilter === "All" || v.condition === conditionFilter;
			const matchesServiceType =
				serviceTypeFilter === "All" || v.service_type === serviceTypeFilter;

			return (
				matchesSearch &&
				matchesStatus &&
				matchesType &&
				matchesCondition &&
				matchesServiceType
			);
		});
	}, [
		vehicles,
		search,
		statusFilter,
		typeFilter,
		conditionFilter,
		serviceTypeFilter,
	]);

	// Sorting
	const sorted = useMemo(() => {
		return [...filtered].sort((a, b) => {
			let comparison = 0;
			if (sortField === "license_plate") {
				comparison = a.license_plate.localeCompare(b.license_plate);
			} else if (sortField === "created_at") {
				comparison =
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
			} else if (sortField === "net_work_seconds") {
				comparison = a.net_work_seconds - b.net_work_seconds;
			} else if (sortField === "status") {
				comparison =
					STATUS_ORDER[getDisplayStatus(a)] - STATUS_ORDER[getDisplayStatus(b)];
			} else if (sortField === "type") {
				comparison = a.type.localeCompare(b.type);
			}
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [filtered, sortField, sortDirection]);

	// Pagination
	const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
	const paginated = useMemo(() => {
		const start = (currentPage - 1) * ROWS_PER_PAGE;
		return sorted.slice(start, start + ROWS_PER_PAGE);
	}, [sorted, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [search, statusFilter, typeFilter, conditionFilter, serviceTypeFilter]);

	const startIndex =
		sorted.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
	const endIndex = Math.min(currentPage * ROWS_PER_PAGE, sorted.length);
	const pageNumbers = useMemo(
		() => getPageNumbers(currentPage, totalPages),
		[currentPage, totalPages],
	);

	// Status counts for filter menu
	const totalActive = vehicles.filter(
		(v) => v.status === "In Progress" && !isPending(v),
	).length;
	const totalCompleted = vehicles.filter(
		(v) => v.status === "Completed",
	).length;
	const totalPending = vehicles.filter(isPending).length;
	const totalOnBreak = vehicles.filter((v) => v.status === "On Break").length;

	return (
		<div className="space-y-6" id="pace-records-container">
			{/* Error Banner */}
			{error && (
				<div className="border border-destructive/40 bg-destructive/10 text-destructive px-4 py-3 text-xs font-mono flex items-center justify-between">
					<span>Failed to connect to Supabase: {error}</span>
					<Button variant="outline" size="xs" onClick={fetchVehicles}>
						<RefreshCw className="size-3 mr-1" />
						Retry
					</Button>
				</div>
			)}

			{/* Main Table Card */}
			<Card className="border-border">
				{/* Table Card Header with Title, Search, and Unified Filter Menu */}
				<CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2.5">
							<CardTitle>Fleet Records Registry</CardTitle>
							<Badge variant="outline" className="font-mono text-xs">
								{filtered.length} of {vehicles.length} Records
							</Badge>
						</div>
						<CardDescription className="mt-1">
							Comprehensive vehicle logs with live timing and status tracking
							from Supabase.
						</CardDescription>
					</div>

					{/* Search field and Unified Filter Menu */}
					<CardAction className="flex items-center gap-2 w-full md:w-auto">
						{/* Search Field */}
						<div className="relative flex-1 md:w-64">
							<Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
							<input
								id="records-search-input"
								type="text"
								placeholder="Search plate, type, service..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full h-8 pl-8.5 pr-7 text-xs border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono shadow-xs"
							/>
							{search && (
								<button
									type="button"
									onClick={() => setSearch("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
									title="Clear search"
									aria-label="Clear search"
								>
									<X className="size-3" />
								</button>
							)}
						</div>

						{/* Unified Filter Menu */}
						<div className="relative shrink-0" ref={filterMenuRef}>
							<Button
								id="records-filter-menu-btn"
								variant={activeFilterCount > 0 ? "default" : "outline"}
								size="sm"
								onClick={() => setIsFilterOpen((prev) => !prev)}
								className={`h-8 gap-1.5 font-mono text-xs select-none transition-all ${
									activeFilterCount > 0
										? "bg-primary text-primary-foreground font-semibold shadow-xs"
										: "text-foreground"
								}`}
								aria-expanded={isFilterOpen}
								aria-haspopup="true"
							>
								{activeFilterCount > 0 ? (
									<Filter className="size-3.5" />
								) : (
									<SlidersHorizontal className="size-3.5 text-muted-foreground" />
								)}
								<span>Filter</span>
								{activeFilterCount > 0 && (
									<span className="ml-0.5 inline-flex items-center justify-center size-4 text-[10px] font-bold bg-primary-foreground text-primary">
										{activeFilterCount}
									</span>
								)}
							</Button>

							{/* Unified Filter Dropdown Popover */}
							{isFilterOpen && (
								<div
									id="records-unified-filter-popover"
									className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-popover text-popover-foreground border border-border shadow-xl p-4 font-mono text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150"
								>
									{/* Filter Menu Header */}
									<div className="flex items-center justify-between pb-2 border-b border-border">
										<div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
											<SlidersHorizontal className="size-3.5 text-primary" />
											<span>Filters</span>
											{activeFilterCount > 0 && (
												<Badge
													variant="outline"
													className="text-[10px] px-1.5 py-0 h-4"
												>
													{activeFilterCount} active
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-1.5">
											{(activeFilterCount > 0 || search) && (
												<button
													type="button"
													onClick={clearAllFilters}
													className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors px-1.5 py-0.5 border border-transparent hover:border-destructive/30"
													title="Reset all filters and search"
												>
													<RotateCcw className="size-3" />
													<span>Reset</span>
												</button>
											)}
											<button
												type="button"
												onClick={() => setIsFilterOpen(false)}
												className="text-muted-foreground hover:text-foreground p-1"
												aria-label="Close filters"
											>
												<X className="size-3.5" />
											</button>
										</div>
									</div>

									{/* 1. Status Filter */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											Status
										</div>
										<div className="grid grid-cols-2 gap-1.5">
											{(
												[
													"All",
													"In Progress",
													"On Break",
													"Completed",
													"Pending",
												] as const
											).map((status) => {
												const active = statusFilter === status;
												const count =
													status === "All"
														? vehicles.length
														: status === "In Progress"
															? totalActive
															: status === "Completed"
																? totalCompleted
																: status === "Pending"
																	? totalPending
																	: totalOnBreak;

												return (
													<button
														key={status}
														type="button"
														onClick={() => setStatusFilter(status)}
														className={`px-2 py-1.5 text-xs text-left border flex items-center justify-between transition-colors ${
															active
																? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
																: "bg-muted/40 border-border text-foreground hover:bg-muted"
														}`}
													>
														<span className="truncate">{status}</span>
														<span
															className={`text-[10px] px-1 py-0.2 ${
																active
																	? "bg-primary-foreground/20 text-primary-foreground font-bold"
																	: "bg-muted text-muted-foreground"
															}`}
														>
															{count}
														</span>
													</button>
												);
											})}
										</div>
									</div>

									{/* 2. Vehicle Type Filter */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											Vehicle Type
										</div>
										<div className="grid grid-cols-4 gap-1.5">
											{(["All", "New", "Used", "Demo"] as const).map((type) => {
												const active = typeFilter === type;
												return (
													<button
														key={type}
														type="button"
														onClick={() => setTypeFilter(type)}
														className={`px-2 py-1 text-xs text-center border transition-colors ${
															active
																? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
																: "bg-muted/40 border-border text-foreground hover:bg-muted"
														}`}
													>
														{type}
													</button>
												);
											})}
										</div>
									</div>

									{/* 3. Service Type Filter */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											Service Type
										</div>
										<div className="grid grid-cols-2 gap-1.5">
											{(
												[
													"All",
													"Full Detail",
													"Ceramic Coating",
													"Quick Detail",
													"Delivery Prep",
												] as const
											).map((st) => {
												const active = serviceTypeFilter === st;
												return (
													<button
														key={st}
														type="button"
														onClick={() => setServiceTypeFilter(st)}
														className={`px-2 py-1.5 text-[11px] text-left border truncate flex items-center justify-between transition-colors ${
															active
																? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
																: "bg-muted/40 border-border text-foreground hover:bg-muted"
														}`}
													>
														<span className="truncate">{st}</span>
														{active && <Check className="size-3 shrink-0 ml-1" />}
													</button>
												);
											})}
										</div>
									</div>

									{/* 4. Condition Filter */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											Condition
										</div>
										<div className="grid grid-cols-5 gap-1">
											{(
												["All", "Excellent", "Good", "Fair", "Poor"] as const
											).map((cond) => {
												const active = conditionFilter === cond;
												return (
													<button
														key={cond}
														type="button"
														onClick={() => setConditionFilter(cond)}
														className={`px-1 py-1 text-[11px] text-center border truncate transition-colors ${
															active
																? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
																: "bg-muted/40 border-border text-foreground hover:bg-muted"
														}`}
													>
														{cond === "Excellent" ? "Excel." : cond}
													</button>
												);
											})}
										</div>
									</div>

									{/* Quick active tags & Close */}
									<div className="pt-2 border-t border-border flex items-center justify-between">
										<span className="text-[11px] text-muted-foreground">
											{filtered.length} matching vehicles
										</span>
										<Button
											size="xs"
											onClick={() => setIsFilterOpen(false)}
											className="px-3"
										>
											Done
										</Button>
									</div>
								</div>
							)}
						</div>
					</CardAction>
				</CardHeader>

				{/* Active Filter Chips (if any filters or search are active) */}
				{(activeFilterCount > 0 || search) && (
					<div className="px-6 py-2.5 bg-muted/20 border-b border-border flex flex-wrap items-center gap-2 text-xs font-mono">
						<span className="text-muted-foreground text-[11px]">
							Active filters:
						</span>
						{search && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-foreground text-[11px]">
								<span>Query: "{search}"</span>
								<button
									type="button"
									onClick={() => setSearch("")}
									className="hover:text-destructive"
								>
									<X className="size-3" />
								</button>
							</span>
						)}
						{statusFilter !== "All" && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-foreground text-[11px]">
								<span>Status: {statusFilter}</span>
								<button
									type="button"
									onClick={() => setStatusFilter("All")}
									className="hover:text-destructive"
								>
									<X className="size-3" />
								</button>
							</span>
						)}
						{typeFilter !== "All" && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-foreground text-[11px]">
								<span>Type: {typeFilter}</span>
								<button
									type="button"
									onClick={() => setTypeFilter("All")}
									className="hover:text-destructive"
								>
									<X className="size-3" />
								</button>
							</span>
						)}
						{serviceTypeFilter !== "All" && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-foreground text-[11px]">
								<span>Service: {serviceTypeFilter}</span>
								<button
									type="button"
									onClick={() => setServiceTypeFilter("All")}
									className="hover:text-destructive"
								>
									<X className="size-3" />
								</button>
							</span>
						)}
						{conditionFilter !== "All" && (
							<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border text-foreground text-[11px]">
								<span>Condition: {conditionFilter}</span>
								<button
									type="button"
									onClick={() => setConditionFilter("All")}
									className="hover:text-destructive"
								>
									<X className="size-3" />
								</button>
							</span>
						)}
						<button
							type="button"
							onClick={clearAllFilters}
							className="text-[11px] text-muted-foreground hover:text-destructive underline ml-1"
						>
							Clear all
						</button>
					</div>
				)}

				{/* Table Records Body */}
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/40">
								<TableHead
									className="w-36 cursor-pointer select-none"
									onClick={() => handleSort("license_plate")}
								>
									<div className="flex items-center gap-1.5">
										<span>License Plate</span>
										{sortField === "license_plate" && (
											<span className="text-primary font-bold">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</TableHead>

								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("type")}
								>
									<div className="flex items-center gap-1.5">
										<span>Type</span>
										{sortField === "type" && (
											<span className="text-primary font-bold">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</TableHead>

								<TableHead>Condition</TableHead>
								<TableHead>Service Type</TableHead>

								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("status")}
								>
									<div className="flex items-center gap-1.5">
										<span>Status</span>
										{sortField === "status" && (
											<span className="text-primary font-bold">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</TableHead>

								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("net_work_seconds")}
								>
									<div className="flex items-center gap-1.5">
										<span>Net Time</span>
										{sortField === "net_work_seconds" && (
											<span className="text-primary font-bold">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</TableHead>

								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center gap-1.5">
										<span>Created Date</span>
										{sortField === "created_at" && (
											<span className="text-primary font-bold">
												{sortDirection === "asc" ? "↑" : "↓"}
											</span>
										)}
									</div>
								</TableHead>

								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{loading ? (
								Array.from({ length: 5 }).map((_, idx) => (
									<TableRow key={`skeleton-${idx}`}>
										<TableCell colSpan={8} className="py-4">
											<div className="h-6 bg-muted animate-pulse w-full" />
										</TableCell>
									</TableRow>
								))
							) : paginated.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={8}
										className="h-40 text-center text-muted-foreground"
									>
										<div className="flex flex-col items-center justify-center gap-2">
											<Search className="size-6 text-muted-foreground/50" />
											<p className="text-xs font-mono uppercase tracking-wider">
												{search || activeFilterCount > 0
													? "No vehicles match the applied filters"
													: "No vehicle records found in database"}
											</p>
											{(search || activeFilterCount > 0) && (
												<Button
													variant="outline"
													size="xs"
													onClick={clearAllFilters}
												>
													Clear Filters
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							) : (
								paginated.map((vehicle) => {
									const displayStatus = getDisplayStatus(vehicle);
									const liveSecs = computeLiveSeconds(vehicle);
									const totalTimeFormatted =
										liveSecs > 0
											? formatDuration(liveSecs)
											: formatDuration(vehicle.net_work_seconds);

									return (
										<TableRow
											key={vehicle.id}
											onClick={() => {
												setSelectedVehicle(vehicle);
												onVehicleSelect?.(vehicle);
											}}
											className={`cursor-pointer hover:bg-muted/40 transition-colors ${
												selectedVehicle?.id === vehicle.id ? "bg-muted/60" : ""
											}`}
										>
											{/* License Plate */}
											<TableCell className="font-bold tracking-wider font-mono text-foreground text-xs uppercase">
												{vehicle.license_plate}
											</TableCell>

											{/* Vehicle Type */}
											<TableCell>
												<span
													className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
														TYPE_COLORS[vehicle.type] || FALLBACK_BADGE_COLOR
													}`}
												>
													{vehicle.type}
												</span>
											</TableCell>

											{/* Condition */}
											<TableCell>
												<span
													className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
														CONDITION_COLORS[vehicle.condition] ||
														FALLBACK_BADGE_COLOR
													}`}
												>
													{vehicle.condition}
												</span>
											</TableCell>

											{/* Service Type */}
											<TableCell className="text-xs font-medium">
												<span
													className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 border ${
														SERVICE_TYPE_COLORS[vehicle.service_type] ||
														FALLBACK_BADGE_COLOR
													}`}
												>
													{vehicle.service_type}
												</span>
											</TableCell>

											{/* Status */}
											<TableCell>
												<span
													className={`inline-flex items-center gap-1.5 text-xs font-mono ${
														displayStatus === "In Progress"
															? "text-sky-600 dark:text-sky-400 font-semibold"
															: displayStatus === "On Break"
																? "text-amber-600 dark:text-amber-400 font-semibold"
																: displayStatus === "Completed"
																	? "text-emerald-600 dark:text-emerald-400 font-semibold"
																	: "text-muted-foreground"
													}`}
												>
													<span
														className={`size-1.5 rounded-full ${
															displayStatus === "In Progress"
																? "bg-sky-500 animate-pulse"
																: displayStatus === "On Break"
																	? "bg-amber-500"
																	: displayStatus === "Completed"
																		? "bg-emerald-500"
																		: "bg-muted-foreground"
														}`}
													/>
													{displayStatus}
												</span>
											</TableCell>

											{/* Time */}
											<TableCell className="font-mono text-xs text-foreground font-semibold tabular-nums">
												{displayStatus === "Pending"
													? "--"
													: totalTimeFormatted}
											</TableCell>

											{/* Created At */}
											<TableCell className="text-xs text-muted-foreground font-mono">
												{formatShortDate(vehicle.created_at)}
											</TableCell>

											{/* Actions */}
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedVehicle(vehicle);
															onVehicleSelect?.(vehicle);
														}}
														title="Inspect & Edit Vehicle"
													>
														<FileEdit className="size-3.5 text-primary" />
													</Button>
													<Button
														variant="destructive"
														size="icon-xs"
														disabled={deletingId === vehicle.id}
														onClick={(e) => handleDelete(e, vehicle)}
														title="Delete Record"
													>
														<Trash2 className="size-3" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>

						<TableFooter>
							<TableRow>
								<TableCell colSpan={4} className="font-mono text-xs">
									Active In-Progress Fleet
								</TableCell>
								<TableCell
									colSpan={4}
									className="text-right font-mono text-xs font-bold"
								>
									{totalActive} Active &bull; {totalOnBreak} On Break &bull;{" "}
									{totalCompleted} Done
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>

				{/* Simplified Footer Pagination: "first, prev - 1, 2, 3... next and last" */}
				<CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground border-t border-border p-4 font-mono">
					{/* Left: Summary */}
					<div className="flex items-center gap-1.5">
						<span>Showing </span>
						<span className="font-bold text-foreground font-mono">
							{sorted.length === 0 ? "0" : `${startIndex}–${endIndex}`}
						</span>
						<span> of </span>
						<span className="font-bold text-foreground font-mono">
							{sorted.length}
						</span>
						<span> vehicles</span>
						{filtered.length !== vehicles.length && (
							<span className="text-muted-foreground/70 text-[11px] ml-1">
								(filtered from {vehicles.length})
							</span>
						)}
					</div>

					{/* Right: Simplified Pagination Controls (first, prev - 1, 2, 3... next and last) */}
					<div className="flex items-center gap-1.5 flex-wrap">
						{/* First Page */}
						<Button
							variant="outline"
							size="icon-xs"
							onClick={() => setCurrentPage(1)}
							disabled={currentPage === 1}
							title="First Page"
							className="h-7 w-7"
						>
							<ChevronsLeft className="size-3.5" />
						</Button>

						{/* Previous Page */}
						<Button
							variant="outline"
							size="xs"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="gap-1 h-7 px-2 font-mono text-xs"
							title="Previous Page"
						>
							<ChevronLeft className="size-3.5" />
							<span>Prev</span>
						</Button>

						{/* Page Number Buttons */}
						<div className="flex items-center gap-1">
							{pageNumbers.map((p, idx) => {
								if (p === "ellipsis") {
									return (
										<span
											key={`ellipsis-${idx}`}
											className="px-1 text-muted-foreground select-none font-mono text-xs"
										>
											&hellip;
										</span>
									);
								}
								const isActive = p === currentPage;
								return (
									<Button
										key={p}
										variant={isActive ? "default" : "outline"}
										size="icon-xs"
										onClick={() => setCurrentPage(p)}
										className={`h-7 w-7 text-xs font-mono ${
											isActive
												? "bg-primary text-primary-foreground font-bold shadow-xs"
												: "text-muted-foreground hover:text-foreground"
										}`}
									>
										{p}
									</Button>
								);
							})}
						</div>

						{/* Next Page */}
						<Button
							variant="outline"
							size="xs"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="gap-1 h-7 px-2 font-mono text-xs"
							title="Next Page"
						>
							<span>Next</span>
							<ChevronRight className="size-3.5" />
						</Button>

						{/* Last Page */}
						<Button
							variant="outline"
							size="icon-xs"
							onClick={() => setCurrentPage(totalPages)}
							disabled={currentPage === totalPages}
							title="Last Page"
							className="h-7 w-7"
						>
							<ChevronsRight className="size-3.5" />
						</Button>
					</div>
				</CardFooter>
			</Card>

			{/* Vehicle Inspection Bottom Sheet with Editable Fields */}
			<VehicleInspectionSheet
				vehicle={selectedVehicle}
				open={!!selectedVehicle}
				onOpenChange={(open) => {
					if (!open) setSelectedVehicle(null);
				}}
				onUpdated={(updatedVehicle) => {
					setVehicles((prev) =>
						prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v)),
					);
					setSelectedVehicle(updatedVehicle);
					onRefresh?.();
				}}
				onDeleted={(deletedId) => {
					setVehicles((prev) => prev.filter((v) => v.id !== deletedId));
					setSelectedVehicle(null);
					onRefresh?.();
				}}
			/>
		</div>
	);
}
