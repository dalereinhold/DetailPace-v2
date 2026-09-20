import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
	className?: string;
	showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = true }: ThemeToggleProps) {
	const { resolvedTheme, toggleTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<Button
			id="theme-toggle-btn"
			variant="outline"
			size="sm"
			onClick={toggleTheme}
			className={cn("gap-1.5 font-mono text-xs h-9", className)}
			title={`Switch to ${isDark ? "light" : "dark"} mode (or press 'D')`}
			aria-label="Toggle theme"
		>
			{isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
			{showLabel && (
				<span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
			)}
		</Button>
	);
}

export default ThemeToggle;
