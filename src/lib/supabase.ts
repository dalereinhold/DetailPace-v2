import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export type VehicleStatus = "In Progress" | "On Break" | "Completed"
export type VehicleType = "New" | "Used" | "Demo"
export type VehicleCondition = "Excellent" | "Good" | "Fair" | "Poor"
export type VehicleServiceType =
  | "Full Detail"
  | "Ceramic Coating"
  | "Quick Detail"
  | "Delivery Prep"

export interface Vehicle {
  id: string
  license_plate: string
  type: VehicleType
  condition: VehicleCondition
  service_type: VehicleServiceType
  status: VehicleStatus
  notes: string | null
  started_at: string | null
  break_started_at: string | null
  net_work_seconds: number
  created_at: string
  updated_at: string
}
