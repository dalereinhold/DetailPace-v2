import type { Vehicle, VehicleStatus } from "@/lib/supabase";

/** A vehicle is "pending" when it hasn't been started yet, despite being
 * nominally "In Progress" (i.e. just added but no timer started). */
export function isPending(vehicle: Vehicle): boolean {
	return (
		vehicle.status === "In Progress" &&
		!vehicle.started_at &&
		vehicle.net_work_seconds === 0
	);
}

/** Display-only status used for sorting/filtering, folding "pending" in as
 * its own bucket distinct from "In Progress". */
export type DisplayStatus = VehicleStatus | "Pending";

export function getDisplayStatus(vehicle: Vehicle): DisplayStatus {
	return isPending(vehicle) ? "Pending" : vehicle.status;
}

/** Sort priority for each display status, lower sorts first. */
export const STATUS_ORDER: Record<DisplayStatus, number> = {
	"In Progress": 1,
	"On Break": 2,
	Pending: 3,
	Completed: 4,
};

/** Computes the live elapsed work time for a vehicle, accounting for an
 * in-progress timer that hasn't been persisted yet. */
export function computeLiveSeconds(vehicle: Vehicle): number {
	const base = vehicle.net_work_seconds;
	if (vehicle.status === "In Progress" && vehicle.started_at) {
		const elapsed = Math.floor(
			(Date.now() - new Date(vehicle.started_at).getTime()) / 1000,
		);
		return base + Math.max(0, elapsed);
	}
	return base;
}

/** Left-border accent class reflecting a vehicle's current status. */
export function statusLeftBorder(
	status: VehicleStatus,
	pending: boolean,
): string {
	if (pending) return "border-l-border";
	if (status === "In Progress") return "border-l-sky-500";
	if (status === "On Break") return "border-l-amber-500";
	return "border-l-emerald-500";
}

/** Formats an ISO timestamp as a short date, e.g. "26:08:22" (yy:mm:dd). */
export function formatShortDate(isoString: string): string {
	const date = new Date(isoString);
	const yy = String(date.getFullYear()).slice(-2);
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yy}-${mm}-${dd}`;
}

/** Formats seconds as a short clock string, e.g. "1h 30m" or "45m". */
export function formatSecondsToClock(seconds?: number | null): string {
	if (seconds == null || Number.isNaN(seconds)) return "--";
	const s = Math.round(seconds);
	const hrs = Math.floor(s / 3600);
	const mins = Math.floor((s % 3600) / 60);
	return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

/** Formats seconds into a minutes display string, e.g. "240 mins" or "45 mins". */
export function formatSecondsToMinutes(seconds?: number | null): string {
	if (seconds == null || Number.isNaN(seconds) || seconds <= 0)
		return "-- mins";
	const mins = Math.round(seconds / 60);
	return `${mins} mins`;
}

/** Formats seconds as digital clock "HH:MM:SS" (e.g. "00:45:00", "01:30:00"). */
export function formatDigitalTime(seconds?: number | null): string {
	if (seconds == null || Number.isNaN(seconds) || seconds < 0)
		return "00:00:00";
	const s = Math.round(seconds);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Computes additional elapsed seconds since a vehicle's timer was started,
 * relative to `now`. Returns 0 if the timer isn't running. */
export function elapsedSecondsSince(
	startedAt: string | null,
	now: Date = new Date(),
): number {
	if (!startedAt) return 0;
	return Math.max(
		0,
		Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1000),
	);
}

/** Formats a duration in seconds as e.g. "1h 05m 30s" or "05m 30s". */
export function formatDuration(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0)
		return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
	return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
