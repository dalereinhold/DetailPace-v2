import type { VehicleCondition, VehicleServiceType, VehicleType } from "@/lib/supabase"

export const VEHICLE_TYPES: VehicleType[] = ["New", "Used", "Demo"]
export const VEHICLE_CONDITIONS: VehicleCondition[] = ["Excellent", "Good", "Fair", "Poor"]

/** Default condition/service type suggested when a vehicle type is picked. */
export const DEFAULTS_BY_VEHICLE_TYPE: Record<
  VehicleType,
  { condition: VehicleCondition; serviceType: VehicleServiceType }
> = {
  New: { condition: "Excellent", serviceType: "Full Detail" },
  Used: { condition: "Fair", serviceType: "Full Detail" },
  Demo: { condition: "Good", serviceType: "Quick Detail" },
}

/** Formats free-typed input into a Swedish-style plate as the user types,
 * e.g. "abc123" -> "ABC 123". */
export function formatLicensePlateInput(value: string): string {
  const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  if (clean.length > 3) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)}`
  }
  return clean.slice(0, 3)
}

const SWEDISH_PLATE_REGEX = /^[A-Z]{3} \d{2}[A-Z0-9]$/

/** Validates a formatted plate against the Swedish plate pattern
 * (e.g. "ABC 123" or "ABC 12A"). */
export function isValidSwedishPlate(plate: string): boolean {
  return SWEDISH_PLATE_REGEX.test(plate)
}
