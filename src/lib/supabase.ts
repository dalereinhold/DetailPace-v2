import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
	(import.meta.env.VITE_SUPABASE_URL as string) ||
	"https://urkwwprxkqlgzryuqryq.supabase.co";
const supabaseAnonKey =
	(import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVya3d3cHJ4a3FsZ3pyeXVxcnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTcwODUsImV4cCI6MjA5ODQ5MzA4NX0.In8H_SgKlHq5Jvzyh-TO6-msqiRJsBLV28XCK-zxgLs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VehicleStatus = "In Progress" | "On Break" | "Completed";
export type VehicleType = "New" | "Used" | "Demo";
export type VehicleCondition = "Excellent" | "Good" | "Fair" | "Poor";
export type VehicleServiceType =
	| "Full Detail"
	| "Ceramic Coating"
	| "Quick Detail"
	| "Delivery Prep";

export interface Vehicle {
	id: string;
	license_plate: string;
	type: VehicleType;
	condition: VehicleCondition;
	service_type: VehicleServiceType;
	status: VehicleStatus;
	notes: string | null;
	started_at: string | null;
	break_started_at: string | null;
	net_work_seconds: number;
	created_at: string;
	updated_at: string;
}
