import type { VehicleServiceType } from "@/lib/supabase";

export interface ServiceTypeDefinition {
	id: string;
	name: VehicleServiceType;
	description: string;
	estimatedSeconds: number;
}

export const SERVICE_TYPES: ServiceTypeDefinition[] = [
	{
		id: "full-detail",
		name: "Full Detail",
		description: "Complete exterior and interior detail",
		estimatedSeconds: 14400,
	},
	{
		id: "ceramic-coating",
		name: "Ceramic Coating",
		description: "Paint prep and coating application",
		estimatedSeconds: 28800,
	},
	{
		id: "quick-detail",
		name: "Quick Detail",
		description: "Express refresh for show-floor delivery",
		estimatedSeconds: 7200,
	},
	{
		id: "delivery-prep",
		name: "Delivery Prep",
		description: "Final preparation before customer delivery",
		estimatedSeconds: 3600,
	},
];
