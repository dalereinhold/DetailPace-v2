import {
	AlertCircle,
	Calendar,
	Car,
	Check,
	CheckCircle2,
	Clock,
	Copy,
	Hash,
	RotateCcw,
	Save,
	Timer,
	Trash2,
	Wrench,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	formatLicensePlateInput,
	isValidSwedishPlate,
	VEHICLE_CONDITIONS,
	VEHICLE_TYPES,
} from "@/lib/pace/intake";
import { SERVICE_TYPES } from "@/lib/pace/services";
import { formatDuration, formatSecondsToClock } from "@/lib/pace/vehicle";
import {
	supabase,
	type Vehicle,
	type VehicleCondition,
	type VehicleServiceType,
	type VehicleStatus,
	type VehicleType,
} from "@/lib/supabase";

interface VehicleInspectionSheetProps {
	vehicle: Vehicle | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated: (updatedVehicle: Vehicle) => void;
	onDeleted?: (vehicleId: string) => void;
}

interface VehicleInspectionFormProps {
	vehicle: Vehicle;
	onOpenChange: (open: boolean) => void;
	onUpdated: (updatedVehicle: Vehicle) => void;
	onDeleted?: (vehicleId: string) => void;
}

function VehicleInspectionForm({
	vehicle,
	onOpenChange,
	onUpdated,
	onDeleted,
}: VehicleInspectionFormProps) {
	// Form state initialized directly from the current vehicle record
	const [licensePlate, setLicensePlate] = useState(vehicle.license_plate);
	const [type, setType] = useState<VehicleType>(vehicle.type);
	const [condition, setCondition] = useState<VehicleCondition>(
		vehicle.condition,
	);
	const [serviceType, setServiceType] = useState<VehicleServiceType>(
		vehicle.service_type,
	);
	const [status, setStatus] = useState<VehicleStatus>(vehicle.status);
	const [notes, setNotes] = useState(vehicle.notes || "");
	const [netMinutes, setNetMinutes] = useState(
		Math.round(vehicle.net_work_seconds / 60),
	);

	// UI state
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState(false);

	// Plate validation
	const isPlateValid = isValidSwedishPlate(licensePlate.trim().toUpperCase());

	// Check if modified compared to initial prop values
	const isDirty =
		licensePlate.trim().toUpperCase() !== vehicle.license_plate ||
		type !== vehicle.type ||
		condition !== vehicle.condition ||
		serviceType !== vehicle.service_type ||
		status !== vehicle.status ||
		(notes.trim() || null) !== (vehicle.notes || null) ||
		netMinutes !== Math.round(vehicle.net_work_seconds / 60);

	const handleReset = () => {
		setLicensePlate(vehicle.license_plate);
		setType(vehicle.type);
		setCondition(vehicle.condition);
		setServiceType(vehicle.service_type);
		setStatus(vehicle.status);
		setNotes(vehicle.notes || "");
		setNetMinutes(Math.round(vehicle.net_work_seconds / 60));
		setError(null);
		setSuccessMessage(null);
	};

	const handleSave = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		const trimmedPlate = licensePlate.trim().toUpperCase();
		if (!trimmedPlate) {
			setError("License plate identifier is required.");
			return;
		}

		if (!isValidSwedishPlate(trimmedPlate)) {
			setError(
				"Invalid Swedish plate format (e.g. ABC 123 or ABC 12A).",
			);
			return;
		}

		setIsSaving(true);
		setError(null);
		setSuccessMessage(null);

		const updatedSeconds = Math.max(0, netMinutes * 60);
		const now = new Date().toISOString();

		let updatedStartedAt = vehicle.started_at;
		let updatedBreakStartedAt = vehicle.break_started_at;

		if (status === "In Progress" && vehicle.status !== "In Progress") {
			updatedStartedAt = now;
			updatedBreakStartedAt = null;
		} else if (status === "On Break" && vehicle.status !== "On Break") {
			updatedStartedAt = null;
			updatedBreakStartedAt = now;
		} else if (status === "Completed") {
			updatedStartedAt = null;
			updatedBreakStartedAt = null;
		}

		const payload = {
			license_plate: trimmedPlate,
			type,
			condition,
			service_type: serviceType,
			status,
			notes: notes.trim() || null,
			net_work_seconds: updatedSeconds,
			started_at: updatedStartedAt,
			break_started_at: updatedBreakStartedAt,
			updated_at: now,
		};

		const { data, error: updateError } = await supabase
			.from("vehicles")
			.update(payload)
			.eq("id", vehicle.id)
			.select()
			.single();

		setIsSaving(false);

		if (updateError) {
			setError(`Failed to update vehicle: ${updateError.message}`);
		} else {
			const updatedVehicleRecord: Vehicle = data as Vehicle;
			setSuccessMessage("Vehicle inspection details saved successfully.");
			onUpdated(updatedVehicleRecord);
			setTimeout(() => {
				setSuccessMessage(null);
			}, 3000);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				`Are you sure you want to delete vehicle ${vehicle.license_plate}? This cannot be undone.`,
			)
		) {
			return;
		}

		setIsDeleting(true);
		const { error: delError } = await supabase
			.from("vehicles")
			.delete()
			.eq("id", vehicle.id);
		setIsDeleting(false);

		if (delError) {
			setError(`Failed to delete record: ${delError.message}`);
		} else {
			onDeleted?.(vehicle.id);
			onOpenChange(false);
		}
	};

	const handleCopyId = () => {
		navigator.clipboard.writeText(vehicle.id);
		setCopiedId(true);
		setTimeout(() => setCopiedId(false), 2000);
	};

	const currentServiceDef = SERVICE_TYPES.find((s) => s.name === serviceType);

	return (
		<>
			{/* Sheet Header */}
			<SheetHeader className="p-5 sm:p-6 border-b border-border bg-muted/30">
				<SheetTitle className="text-xl font-heading font-black tracking-wider uppercase text-foreground">
					Vehicle Inspection
				</SheetTitle>
			</SheetHeader>

			{/* Main Sheet Body */}
			<div className="p-5 sm:p-6">
				{/* Feedback Alerts */}
				{(successMessage || error) && (
					<div className="mb-5 space-y-2">
						{successMessage && (
							<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 text-xs font-mono flex items-center gap-2 animate-in fade-in">
								<CheckCircle2 className="size-4 shrink-0" />
								<span>{successMessage}</span>
							</div>
						)}
						{error && (
							<div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-xs font-mono flex items-center gap-2 animate-in fade-in">
								<AlertCircle className="size-4 shrink-0" />
								<span>{error}</span>
							</div>
						)}
					</div>
				)}

				{/* Inspection Form */}
				<form onSubmit={handleSave} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Left Column: Core Identifiers & Service */}
						<div className="space-y-4">
							<div className="border border-border p-4 bg-muted/20 space-y-4">
								<div className="flex items-center justify-between border-b border-border/60 pb-2">
									<span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
										<Car className="size-3.5 text-primary" />
										Identification &amp; Classification
									</span>
									<span
										className={`text-[10px] font-mono px-2 py-0.5 border ${
											isPlateValid
												? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
												: "bg-amber-500/10 text-amber-600 border-amber-500/30"
										}`}
									>
										{isPlateValid ? "Valid Format" : "Invalid Format"}
									</span>
								</div>

								{/* License Plate Field */}
								<div>
									<label className="block text-xs font-mono font-semibold uppercase text-muted-foreground mb-1">
										License Plate (Registration Number)
									</label>
									<input
										type="text"
										value={licensePlate}
										onChange={(e) => {
											setLicensePlate(
												formatLicensePlateInput(e.target.value),
											);
											if (error) setError(null);
										}}
										maxLength={7}
										className="w-full h-10 px-3 border border-input bg-background font-mono font-bold text-base uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
										placeholder="ABC 123"
									/>
									<span className="text-[11px] font-mono text-muted-foreground mt-1 block">
										Swedish format: 3 letters + 2 digits + 1 alphanumeric (e.g. ABC 123).
									</span>
								</div>

								{/* Vehicle Classification Type */}
								<div>
									<label className="block text-xs font-mono font-semibold uppercase text-muted-foreground mb-1">
										Classification Type
									</label>
									<div className="grid grid-cols-3 gap-2">
										{VEHICLE_TYPES.map((t) => (
											<button
												key={t}
												type="button"
												onClick={() => setType(t)}
												className={`h-9 border text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
													type === t
														? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
														: "bg-background text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
												}`}
											>
												<span>{t}</span>
												{type === t && <Check className="size-3" />}
											</button>
										))}
									</div>
								</div>

								{/* Condition Rating */}
								<div>
									<label className="block text-xs font-mono font-semibold uppercase text-muted-foreground mb-1">
										Condition Rating
									</label>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
										{VEHICLE_CONDITIONS.map((c) => (
											<button
												key={c}
												type="button"
												onClick={() => setCondition(c)}
												className={`h-8 border text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1 ${
													condition === c
														? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
														: "bg-background text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
												}`}
											>
												<span>{c}</span>
											</button>
										))}
									</div>
								</div>
							</div>

							{/* Service Package Selection */}
							<div className="border border-border p-4 bg-muted/20 space-y-3">
								<div className="flex items-center justify-between border-b border-border/60 pb-2">
									<span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
										<Wrench className="size-3.5 text-primary" />
										Service Package Assignment
									</span>
									<Badge variant="outline" className="font-mono text-[10px]">
										Est: {formatSecondsToClock(currentServiceDef?.estimatedSeconds)}
									</Badge>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{SERVICE_TYPES.map((s) => {
										const active = serviceType === s.name;
										return (
											<button
												key={s.id}
												type="button"
												onClick={() => setServiceType(s.name)}
												className={`p-2.5 text-left border transition-all ${
													active
														? "bg-primary/10 border-primary shadow-xs"
														: "bg-background border-input hover:border-border hover:bg-muted/40"
												}`}
											>
												<div className="flex items-center justify-between mb-0.5">
													<span
														className={`text-xs font-bold font-mono uppercase ${
															active ? "text-primary" : "text-foreground"
														}`}
													>
														{s.name}
													</span>
													<span className="text-[10px] font-mono text-muted-foreground">
														{formatSecondsToClock(s.estimatedSeconds)}
													</span>
												</div>
												<p className="text-[10px] text-muted-foreground line-clamp-1">
													{s.description}
												</p>
											</button>
										);
									})}
								</div>
							</div>
						</div>

						{/* Right Column: Workflow Status, Timing, Notes & Audit */}
						<div className="space-y-4">
							{/* Status & Work Time */}
							<div className="border border-border p-4 bg-muted/20 space-y-4">
								<div className="flex items-center justify-between border-b border-border/60 pb-2">
									<span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
										<Timer className="size-3.5 text-primary" />
										Workflow Status &amp; Time Tracking
									</span>
								</div>

								{/* Status Buttons */}
								<div>
									<label className="block text-xs font-mono font-semibold uppercase text-muted-foreground mb-1">
										Current Workflow Status
									</label>
									<div className="grid grid-cols-3 gap-2">
										{(
											[
												"In Progress",
												"On Break",
												"Completed",
											] as VehicleStatus[]
										).map((st) => {
											const active = status === st;
											return (
												<button
													key={st}
													type="button"
													onClick={() => setStatus(st)}
													className={`h-9 border text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
														active
															? st === "In Progress"
																? "bg-sky-600 text-white border-sky-600 shadow-xs"
																: st === "On Break"
																	? "bg-amber-600 text-white border-amber-600 shadow-xs"
																	: "bg-emerald-600 text-white border-emerald-600 shadow-xs"
															: "bg-background text-muted-foreground border-input hover:text-foreground hover:bg-muted/50"
													}`}
												>
													<span>{st}</span>
													{active && <Check className="size-3" />}
												</button>
											);
										})}
									</div>
								</div>

								{/* Net Work Minutes Adjustment */}
								<div>
									<div className="flex items-center justify-between mb-1">
										<label className="text-xs font-mono font-semibold uppercase text-muted-foreground">
											Tracked Net Work Time (Minutes)
										</label>
										<span className="text-xs font-mono text-foreground font-bold">
											{formatDuration(Math.max(0, netMinutes * 60))}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<input
											type="number"
											min={0}
											step={1}
											value={netMinutes}
											onChange={(e) =>
												setNetMinutes(
													Math.max(0, parseInt(e.target.value) || 0),
												)
											}
											className="w-full h-9 px-3 border border-input bg-background font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
										/>
										<div className="flex items-center gap-1 shrink-0">
											<Button
												type="button"
												variant="outline"
												size="xs"
												onClick={() =>
													setNetMinutes((m) => Math.max(0, m - 15))
												}
												className="font-mono text-xs"
												title="Subtract 15 minutes"
											>
												-15m
											</Button>
											<Button
												type="button"
												variant="outline"
												size="xs"
												onClick={() => setNetMinutes((m) => m + 15)}
												className="font-mono text-xs"
												title="Add 15 minutes"
											>
												+15m
											</Button>
										</div>
									</div>
									<span className="text-[11px] font-mono text-muted-foreground mt-1 block">
										Manual adjustment for detailing bay work logs.
									</span>
								</div>
							</div>

							{/* Notes */}
							<div className="border border-border p-4 bg-muted/20 space-y-2">
								<div className="flex items-center justify-between border-b border-border/60 pb-2">
									<span className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground">
										Detailing Notes &amp; Special Instructions
									</span>
									<span className="text-[10px] font-mono text-muted-foreground">
										{notes.length} chars
									</span>
								</div>
								<textarea
									rows={3}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="e.g. Paint scratch on right rear door, leather conditioning required..."
									className="w-full p-2.5 text-xs font-mono border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
								/>
							</div>

							{/* Audit Metadata */}
							<div className="p-3 bg-muted/40 border border-border text-[11px] font-mono text-muted-foreground space-y-1">
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1">
										<Hash className="size-3" /> Record ID:
									</span>
									<button
										type="button"
										onClick={handleCopyId}
										className="flex items-center gap-1 text-foreground hover:underline"
										title="Copy full UUID"
									>
										<span>{vehicle.id.slice(0, 18)}...</span>
										<Copy className="size-2.5" />
										{copiedId && (
											<span className="text-emerald-500 text-[9px]">
												Copied!
											</span>
										)}
									</button>
								</div>
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1">
										<Calendar className="size-3" /> Created:
									</span>
									<span className="text-foreground">
										{new Date(vehicle.created_at).toLocaleString()}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1">
										<Clock className="size-3" /> Last Updated:
									</span>
									<span className="text-foreground">
										{vehicle.updated_at
											? new Date(vehicle.updated_at).toLocaleString()
											: "Never"}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<SheetClose asChild>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="font-mono text-xs"
								>
									Close
								</Button>
							</SheetClose>
						</div>

						<div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleReset}
								disabled={!isDirty || isSaving}
								className="font-mono text-xs gap-1.5"
							>
								<RotateCcw className="size-3.5" />
								<span>Reset Edits</span>
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleDelete}
								disabled={isDeleting}
								className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 text-xs font-mono"
								title="Delete this vehicle record"
							>
								<Trash2 className="size-3.5" />
								<span>{isDeleting ? "Deleting..." : "Delete"}</span>
							</Button>
							<Button
								type="submit"
								size="sm"
								disabled={isSaving || !isPlateValid}
								className="font-mono text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
							>
								<Save className="size-3.5" />
								<span>{isSaving ? "Saving..." : "Save Changes"}</span>
							</Button>
						</div>
					</div>
				</form>
			</div>
		</>
	);
}

export default function VehicleInspectionSheet({
	vehicle,
	open,
	onOpenChange,
	onUpdated,
	onDeleted,
}: VehicleInspectionSheetProps) {
	const isMobile = useIsMobile();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side={isMobile ? "bottom" : "bottom"}
				className="w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-0 border-t border-border rounded-none shadow-2xl"
			>
				{vehicle && (
					<VehicleInspectionForm
						key={vehicle.id}
						vehicle={vehicle}
						onOpenChange={onOpenChange}
						onUpdated={onUpdated}
						onDeleted={onDeleted}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
