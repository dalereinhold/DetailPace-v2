import { useCallback, useEffect, useState } from "react";
import { VEHICLE_TYPES } from "@/lib/pace/intake";
import { SERVICE_TYPES } from "@/lib/pace/services";
import { formatDuration } from "@/lib/pace/vehicle";
import {
	supabase,
	type Vehicle,
	type VehicleServiceType,
	type VehicleType,
} from "@/lib/supabase";

/** Actual vs. estimated timing stats for a group of completed vehicles. */
export interface TypeStats {
	count: number;
	avgSeconds: number;
	avgFormatted: string;
	/** Average estimated seconds for the group, based on each vehicle's
	 * assigned service type. */
	estimatedSeconds: number;
	estimatedFormatted?: string;
	varianceSeconds: number;
	variancePct: number;
	minSeconds?: number;
	maxSeconds?: number;
}

export interface OverallStats {
	totalInDb: number;
	totalProcessed: number;
	totalActive: number;
	completionPct: number;
	avgSeconds: number;
	avgFormatted: string;
	estimatedSeconds: number;
	estimatedFormatted: string;
	varianceSeconds: number;
	variancePct: number;
	onTimeCount: number;
	onTimePct: number;
	fastestType: VehicleType | null;
	slowestType: VehicleType | null;
}

export interface Stats {
	/** Total vehicles ever recorded, regardless of status. */
	totalInDb: number;
	/** Vehicles with status "Completed". */
	totalProcessed: number;
	/** Vehicle counts by type, regardless of status. */
	totalByType: Record<VehicleType, number>;
	byType: Record<VehicleType, TypeStats>;
	byService: Record<VehicleServiceType, TypeStats>;
	/** Average time stats broken down by vehicle type, then service type. */
	byTypeAndService: Record<VehicleType, Record<VehicleServiceType, TypeStats>>;
	overall: OverallStats;
	lastUpdated: number;
}

const STORAGE_KEY = "detailtrack_stats_cache";
/** Bump whenever the `Stats` shape changes, to invalidate stale caches. */
const CACHE_VERSION = 4;

interface CacheEnvelope {
	version: number;
	stats: Stats;
}
const SERVICE_TYPE_NAMES: VehicleServiceType[] = SERVICE_TYPES.map(
	(s) => s.name,
);
const ESTIMATED_SECONDS_BY_SERVICE: Record<VehicleServiceType, number> =
	Object.fromEntries(
		SERVICE_TYPES.map((s) => [s.name, s.estimatedSeconds]),
	) as Record<VehicleServiceType, number>;

function average(seconds: number[]): number {
	if (seconds.length === 0) return 0;
	return Math.round(seconds.reduce((sum, s) => sum + s, 0) / seconds.length);
}

function toTypeStats(group: Vehicle[]): TypeStats {
	const times = group.map((v) => v.net_work_seconds).filter((s) => s > 0);
	const avgSeconds = average(times);
	const estimatedSeconds = average(
		group.map((v) => ESTIMATED_SECONDS_BY_SERVICE[v.service_type] ?? 0),
	);
	const varianceSeconds =
		avgSeconds > 0 && estimatedSeconds > 0 ? avgSeconds - estimatedSeconds : 0;
	const variancePct =
		estimatedSeconds > 0 && avgSeconds > 0
			? Math.round(((avgSeconds - estimatedSeconds) / estimatedSeconds) * 100)
			: 0;

	return {
		count: group.length,
		avgSeconds,
		avgFormatted: avgSeconds > 0 ? formatDuration(avgSeconds) : "--",
		estimatedSeconds,
		estimatedFormatted:
			estimatedSeconds > 0 ? formatDuration(estimatedSeconds) : "--",
		varianceSeconds,
		variancePct,
		minSeconds: times.length > 0 ? Math.min(...times) : 0,
		maxSeconds: times.length > 0 ? Math.max(...times) : 0,
	};
}

function computeStats(allVehicles: Vehicle[]): Stats {
	const completed = allVehicles.filter((v) => v.status === "Completed");

	const totalByType = {} as Record<VehicleType, number>;
	const byType = {} as Record<VehicleType, TypeStats>;
	for (const type of VEHICLE_TYPES) {
		totalByType[type] = allVehicles.filter((v) => v.type === type).length;
		byType[type] = toTypeStats(completed.filter((v) => v.type === type));
	}

	const byService = {} as Record<VehicleServiceType, TypeStats>;
	for (const serviceType of SERVICE_TYPE_NAMES) {
		byService[serviceType] = toTypeStats(
			completed.filter((v) => v.service_type === serviceType),
		);
	}

	const byTypeAndService = {} as Record<
		VehicleType,
		Record<VehicleServiceType, TypeStats>
	>;
	for (const type of VEHICLE_TYPES) {
		const typeGroup = completed.filter((v) => v.type === type);
		const perService = {} as Record<VehicleServiceType, TypeStats>;
		for (const serviceType of SERVICE_TYPE_NAMES) {
			perService[serviceType] = toTypeStats(
				typeGroup.filter((v) => v.service_type === serviceType),
			);
		}
		byTypeAndService[type] = perService;
	}

	// Overall computations
	const totalInDb = allVehicles.length;
	const totalProcessed = completed.length;
	const totalActive = totalInDb - totalProcessed;
	const completionPct =
		totalInDb > 0 ? Math.round((totalProcessed / totalInDb) * 100) : 0;

	const allCompletedTimes = completed
		.map((v) => v.net_work_seconds)
		.filter((s) => s > 0);
	const overallAvgSeconds = average(allCompletedTimes);
	const overallEstimatedSeconds = average(
		completed.map((v) => ESTIMATED_SECONDS_BY_SERVICE[v.service_type] ?? 0),
	);
	const overallVarianceSeconds =
		overallAvgSeconds > 0 && overallEstimatedSeconds > 0
			? overallAvgSeconds - overallEstimatedSeconds
			: 0;
	const overallVariancePct =
		overallEstimatedSeconds > 0 && overallAvgSeconds > 0
			? Math.round(
					((overallAvgSeconds - overallEstimatedSeconds) /
						overallEstimatedSeconds) *
						100,
				)
			: 0;

	const onTimeVehicles = completed.filter((v) => {
		const est = ESTIMATED_SECONDS_BY_SERVICE[v.service_type] || 0;
		return est > 0 && v.net_work_seconds <= est;
	});
	const onTimeCount = onTimeVehicles.length;
	const onTimePct =
		completed.length > 0
			? Math.round((onTimeCount / completed.length) * 100)
			: 0;

	// Determine fastest & slowest vehicle types by avg time
	const typesWithData = VEHICLE_TYPES.filter(
		(t) => byType[t].count > 0 && byType[t].avgSeconds > 0,
	);
	let fastestType: VehicleType | null = null;
	let slowestType: VehicleType | null = null;
	if (typesWithData.length > 0) {
		const sorted = [...typesWithData].sort(
			(a, b) => byType[a].avgSeconds - byType[b].avgSeconds,
		);
		fastestType = sorted[0];
		slowestType = sorted[sorted.length - 1];
	}

	const overall: OverallStats = {
		totalInDb,
		totalProcessed,
		totalActive,
		completionPct,
		avgSeconds: overallAvgSeconds,
		avgFormatted:
			overallAvgSeconds > 0 ? formatDuration(overallAvgSeconds) : "--",
		estimatedSeconds: overallEstimatedSeconds,
		estimatedFormatted:
			overallEstimatedSeconds > 0
				? formatDuration(overallEstimatedSeconds)
				: "--",
		varianceSeconds: overallVarianceSeconds,
		variancePct: overallVariancePct,
		onTimeCount,
		onTimePct,
		fastestType,
		slowestType,
	};

	return {
		totalInDb,
		totalProcessed,
		totalByType,
		byType,
		byService,
		byTypeAndService,
		overall,
		lastUpdated: Date.now(),
	};
}

function isValidStats(value: unknown): value is Stats {
	if (!value || typeof value !== "object") return false;
	const stats = value as Partial<Stats>;
	return (
		typeof stats.totalInDb === "number" &&
		typeof stats.totalProcessed === "number" &&
		typeof stats.totalByType === "object" &&
		stats.totalByType !== null &&
		VEHICLE_TYPES.every((t) => typeof stats.totalByType?.[t] === "number") &&
		typeof stats.byTypeAndService === "object" &&
		stats.byTypeAndService !== null &&
		VEHICLE_TYPES.every(
			(t) => typeof stats.byTypeAndService?.[t] === "object",
		) &&
		typeof stats.overall === "object" &&
		stats.overall !== null
	);
}

function loadCache(): Stats | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<CacheEnvelope>;
		if (parsed.version !== CACHE_VERSION || !isValidStats(parsed.stats)) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return parsed.stats;
	} catch {
		return null;
	}
}

function saveCache(stats: Stats) {
	try {
		const envelope: CacheEnvelope = { version: CACHE_VERSION, stats };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
	} catch {
		// storage quota — silently ignore
	}
}

export function useStats(refreshTrigger: number) {
	const [stats, setStats] = useState<Stats | null>(() => loadCache());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		setLoading(true);
		setError(null);
		const { data, error: dbError } = await supabase
			.from("vehicles")
			.select("status, type, net_work_seconds, service_type");

		if (dbError) {
			setError(dbError.message);
		} else {
			const computed = computeStats((data ?? []) as Vehicle[]);
			saveCache(computed);
			setStats(computed);
		}
		setLoading(false);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is an intentional refetch signal, not read inside the effect.
	useEffect(() => {
		fetchStats();
	}, [refreshTrigger, fetchStats]);

	return { stats, loading, error, refetch: fetchStats };
}
