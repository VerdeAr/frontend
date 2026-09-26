import {
	AlertCircle,
	CheckCircle2,
	ClipboardList,
	Clock,
	Loader2,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saleService } from "@/services/sale.service";
import type { SellerOrderResponse } from "@/types";
import { SellerOrderCard } from "./SellerOrderCard";

type StatusFilter = "" | "ABERTA" | "FINALIZADA" | "CANCELADA";

const FILTERS: {
	label: string;
	value: StatusFilter;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ label: "Todos", value: "", icon: ClipboardList },
	{ label: "Pendentes", value: "ABERTA", icon: Clock },
	{ label: "Concluídos", value: "FINALIZADA", icon: CheckCircle2 },
	{ label: "Cancelados", value: "CANCELADA", icon: XCircle },
];

export function SellerOrdersManager() {
	const [orders, setOrders] = useState<SellerOrderResponse[]>([]);
	const [pendingCount, setPendingCount] = useState<number>(0);
	const [activeFilter, setActiveFilter] = useState<StatusFilter>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const [ordersData, countData] = await Promise.all([
				saleService.getSellerOrders(activeFilter || undefined),
				saleService.getPendingOrdersCount(),
			]);

			setOrders(ordersData);
			setPendingCount(countData.count);
		} catch (err) {
			console.error("Erro ao carregar pedidos do vendedor:", err);
			setError("Não foi possível carregar os pedidos recebidos.");
		} finally {
			setIsLoading(false);
		}
	}, [activeFilter]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleUpdateStatus = async (
		orderId: string,
		newStatus: "FINALIZADA" | "CANCELADA",
	) => {
		await saleService.updateOrderStatus(orderId, newStatus);
		await loadData();
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<div className="flex items-center gap-2.5">
						<h2 className="text-lg sm:text-xl font-bold text-foreground">
							Pedidos Recebidos
						</h2>
						{pendingCount > 0 && (
							<Badge
								variant="secondary"
								className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 gap-1 text-xs"
							>
								<Clock className="size-3" />
								<span>
									{pendingCount} pendente{pendingCount > 1 ? "s" : ""}
								</span>
							</Badge>
						)}
					</div>
					<p className="text-xs text-muted-foreground mt-0.5">
						Gerencie e avance o status dos pedidos que contêm produtos da sua
						propriedade
					</p>
				</div>
			</div>

			{/* Filter Tabs (Horizontal Scrollable on Mobile) */}
			<div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto no-scrollbar">
				{FILTERS.map((filter) => {
					const Icon = filter.icon;
					const isActive = activeFilter === filter.value;

					return (
						<button
							key={filter.value}
							type="button"
							onClick={() => setActiveFilter(filter.value)}
							className={cn(
								"h-10 px-3.5 flex items-center gap-1.5 text-xs font-medium border-b-2 transition-all select-none whitespace-nowrap -mb-px",
								isActive
									? "border-primary text-foreground font-semibold"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
							)}
						>
							<Icon className={cn("size-3.5", isActive && "text-primary")} />
							<span>{filter.label}</span>
							{filter.value === "ABERTA" && pendingCount > 0 && (
								<span className="ml-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
									{pendingCount}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Loading State */}
			{isLoading ? (
				<div className="flex min-h-64 items-center justify-center py-12">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			) : error ? (
				<div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
					<AlertCircle className="size-8 text-destructive" />
					<p className="text-sm text-destructive">{error}</p>
					<button
						type="button"
						onClick={() => loadData()}
						className="h-9 px-4 text-xs font-semibold rounded-xl border border-input bg-background hover:bg-muted transition-colors"
					>
						Tentar novamente
					</button>
				</div>
			) : orders.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
					<div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
						<ClipboardList className="size-8" />
					</div>
					<h3 className="text-lg font-bold text-foreground mb-1">
						Nenhum pedido encontrado
					</h3>
					<p className="text-sm text-muted-foreground max-w-sm">
						{activeFilter
							? "Não há pedidos com o status selecionado no momento."
							: "Você ainda não recebeu pedidos com seus produtos agrícolas."}
					</p>
				</div>
			) : (
				/* Orders Cards List */
				<div className="flex flex-col gap-4">
					{orders.map((order) => (
						<SellerOrderCard
							key={order.id}
							order={order}
							onUpdateStatus={handleUpdateStatus}
						/>
					))}
				</div>
			)}
		</div>
	);
}
