import {
	CheckCircle2,
	Clock,
	Hourglass,
	PackageOpen,
	Truck,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	getSaleStatusLabel,
	getSaleStatusTone,
	type SaleStatusAudience,
	type SaleStatusTone,
} from "@/lib/sale-status";
import { cn } from "@/lib/utils";
import type { SaleStatus } from "@/types";

const STATUS_ICONS: Record<
	SaleStatus,
	React.ComponentType<{ className?: string }>
> = {
	ABERTA: Clock,
	EM_PREPARACAO: PackageOpen,
	A_CAMINHO: Truck,
	AGUARDANDO_APROVACAO_CLIENTE: Hourglass,
	FINALIZADA: CheckCircle2,
	CANCELADA: XCircle,
};

const TONE_CLASSES: Record<SaleStatusTone, string> = {
	pending:
		"bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
	progress: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
	attention:
		"bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40",
	success:
		"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
	danger: "bg-destructive/15 text-destructive border-destructive/30",
};

export interface SaleStatusBadgeProps {
	status: SaleStatus;
	/** Quem está vendo: muda o texto do ajuste pendente para o cliente. */
	audience?: SaleStatusAudience;
	className?: string;
}

/** Selo de status do pedido, compartilhado entre o painel do vendedor e o histórico do cliente. */
export function SaleStatusBadge({
	status,
	audience = "seller",
	className,
}: SaleStatusBadgeProps) {
	const Icon = STATUS_ICONS[status];

	return (
		<Badge
			variant="secondary"
			className={cn(
				"border gap-1.5 py-1 text-xs font-semibold",
				TONE_CLASSES[getSaleStatusTone(status)],
				className,
			)}
		>
			<Icon className="size-3.5" aria-hidden="true" />
			<span>{getSaleStatusLabel(status, audience)}</span>
		</Badge>
	);
}
