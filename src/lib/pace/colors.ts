import type {
	VehicleCondition,
	VehicleServiceType,
	VehicleType,
} from "@/lib/supabase";

/**
 * Badge-style color classes (text + soft background + border) keyed by
 * vehicle attribute. This is the single source of truth for these badges
 * across all Pace Pro components (vehicle card, intake form, etc.).
 */
export const TYPE_COLORS: Record<VehicleType, string> = {
	New: "text-sky-500 bg-sky-500/10 border-sky-500/20",
	Used: "text-amber-500 bg-amber-500/10 border-amber-500/20",
	Demo: "text-purple-500 bg-purple-500/10 border-purple-500/20",
};

export const CONDITION_COLORS: Record<VehicleCondition, string> = {
	Excellent: "text-sky-500 bg-sky-500/10 border-sky-500/20",
	Good: "text-purple-500 bg-purple-500/10 border-purple-500/20",
	Fair: "text-amber-500 bg-amber-500/10 border-amber-500/20",
	Poor: "text-red-500 bg-red-500/10 border-red-500/20",
};

export const SERVICE_TYPE_COLORS: Record<VehicleServiceType, string> = {
	"Full Detail": "text-sky-500 bg-sky-500/10 border-sky-500/20",
	"Ceramic Coating": "text-purple-500 bg-purple-500/10 border-purple-500/20",
	"Quick Detail": "text-amber-500 bg-amber-500/10 border-amber-500/20",
	"Delivery Prep": "text-red-500 bg-red-500/10 border-red-500/20",
};

/** Fallback badge classes for values not present in a color map above. */
export const FALLBACK_BADGE_COLOR =
	"text-muted-foreground bg-muted border-border";

/** Solid-fill bar color for the "cars by type" breakdown, keyed by type. */
export const VEHICLE_TYPE_BAR_COLORS: Record<VehicleType, string> = {
	New: "bg-emerald-500",
	Used: "bg-muted-foreground/40",
	Demo: "bg-sky-500",
};
