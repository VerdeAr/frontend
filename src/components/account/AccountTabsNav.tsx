import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccountTab<T extends string = string> {
	id: T;
	label: string;
	icon: LucideIcon;
}

export interface AccountTabsNavProps<T extends string = string> {
	/** Lista de abas disponíveis. */
	tabs: AccountTab<T>[];
	/** ID da aba atualmente ativa. */
	activeTab: T;
	/** Callback acionado ao selecionar uma aba. */
	onTabChange: (tabId: T) => void;
	className?: string;
}

/**
 * Navegação de abas da conta — scrollable horizontalmente no mobile.
 * Genérico o suficiente para ser reutilizado em outros contextos de abas.
 */
export function AccountTabsNav<T extends string = string>({
	tabs,
	activeTab,
	onTabChange,
	className,
}: AccountTabsNavProps<T>) {
	return (
		<div
			role="tablist"
			aria-label="Seções da conta"
			className={cn(
				"flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto no-scrollbar",
				className,
			)}
		>
			{tabs.map((tab) => {
				const Icon = tab.icon;
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onTabChange(tab.id)}
						className={cn(
							"h-11 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-all select-none whitespace-nowrap -mb-px",
							isActive
								? "border-primary text-foreground font-semibold"
								: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
						)}
					>
						<Icon className={cn("size-4", isActive && "text-primary")} />
						<span>{tab.label}</span>
					</button>
				);
			})}
		</div>
	);
}
