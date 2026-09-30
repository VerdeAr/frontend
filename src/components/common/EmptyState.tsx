import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
	label: string;
	onClick: () => void;
	/** Ícone opcional exibido ao lado do rótulo da ação. */
	icon?: LucideIcon;
}

export interface EmptyStateProps {
	/** Ícone principal exibido no topo do estado vazio. */
	icon: LucideIcon;
	/** Título principal. */
	title: string;
	/** Mensagem descritiva complementar. */
	message?: string;
	/** Ação primária opcional (botão principal). */
	action?: EmptyStateAction;
	/** Ação secundária opcional (botão secundário). */
	secondaryAction?: EmptyStateAction;
	/** Variante visual do container. */
	variant?: "default" | "dashed";
	className?: string;
	children?: React.ReactNode;
}

/**
 * Componente de estado vazio genérico.
 * Utilizado para sacola vazia, catálogo sem resultados, histórico vazio, etc.
 */
export function EmptyState({
	icon: Icon,
	title,
	message,
	action,
	secondaryAction,
	variant = "default",
	className,
	children,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col items-center justify-center rounded-3xl p-8 sm:p-12 text-center",
				variant === "dashed"
					? "border border-dashed border-border/80 bg-card/50"
					: "border border-border/60 bg-card/50",
				className,
			)}
		>
			{/* Ícone decorativo */}
			<div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
				<Icon className="size-8" />
			</div>

			{/* Título */}
			<h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
				{title}
			</h3>

			{/* Mensagem */}
			{message && (
				<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-6">
					{message}
				</p>
			)}

			{/* Slot para conteúdo customizado */}
			{children}

			{/* Ações */}
			{(action || secondaryAction) && (
				<div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
					{secondaryAction && (
						<button
							type="button"
							onClick={secondaryAction.onClick}
							className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
						>
							{secondaryAction.icon && (
								<secondaryAction.icon className="size-4" />
							)}
							{secondaryAction.label}
						</button>
					)}
					{action && (
						<button
							type="button"
							onClick={action.onClick}
							className="inline-flex items-center gap-2 h-11 rounded-2xl px-5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
						>
							{action.icon && <action.icon className="size-4" />}
							{action.label}
						</button>
					)}
				</div>
			)}
		</div>
	);
}
