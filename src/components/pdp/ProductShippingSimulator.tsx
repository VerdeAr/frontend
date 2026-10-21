import { CheckCircle2, Clock, MapPin, Store, Truck } from "lucide-react";
import { useId, useState } from "react";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Neighborhood } from "@/types";

export interface ProductShippingSimulatorProps {
	sellerFixedShippingRate?: number | null;
	neighborhoods?: Neighborhood[];
	className?: string;
}

export function ProductShippingSimulator({
	sellerFixedShippingRate,
	neighborhoods = [],
	className,
}: ProductShippingSimulatorProps) {
	const selectId = useId();
	const [selectedNeighborhoodId, setSelectedNeighborhoodId] =
		useState<string>("");

	const selectedNeighborhood = neighborhoods.find(
		(n) => n.id === selectedNeighborhoodId,
	);

	// Determina o valor do frete
	const shippingPrice =
		typeof sellerFixedShippingRate === "number" && sellerFixedShippingRate >= 0
			? sellerFixedShippingRate
			: 10.0; // Taxa padrão estimada se não houver taxa fixa cadastrada

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-xs sm:rounded-3xl sm:p-5",
				className,
			)}
		>
			{/* Cabeçalho */}
			<div className="flex items-center gap-2">
				<div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
					<Truck className="size-5" />
				</div>
				<div>
					<h2 className="text-sm font-bold text-foreground sm:text-base">
						Simulação de Frete e Entrega
					</h2>
					<p className="text-[11px] text-muted-foreground sm:text-xs">
						Calcule o valor e o prazo direto com o produtor
					</p>
				</div>
			</div>

			{/* Seletor de Bairro (Mobile-first com Touch Target >= 44px) */}
			<div className="flex flex-col gap-1.5 pt-1">
				<label
					htmlFor={selectId}
					className="text-xs font-medium text-foreground flex items-center gap-1"
				>
					<MapPin className="size-3.5 text-muted-foreground" />
					<span>Selecione seu bairro para simular:</span>
				</label>

				<select
					id={selectId}
					value={selectedNeighborhoodId}
					onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
					className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:text-sm"
				>
					<option value="">Selecione o bairro de entrega...</option>
					{neighborhoods.map((neighborhood) => (
						<option key={neighborhood.id} value={neighborhood.id}>
							{neighborhood.name}
							{neighborhood.city ? ` - ${neighborhood.city}` : ""}
						</option>
					))}
				</select>
			</div>

			{/* Resultado da Simulação */}
			{selectedNeighborhoodId && selectedNeighborhood && (
				<div className="flex flex-col gap-2.5 rounded-xl border border-emerald-600/20 bg-emerald-50/60 p-3 text-xs dark:bg-emerald-950/30">
					<div className="flex items-center justify-between gap-2">
						<span className="font-semibold text-foreground">
							Entrega em {selectedNeighborhood.name}:
						</span>
						<span className="font-bold text-emerald-700 dark:text-emerald-300">
							{shippingPrice === 0 ? "Grátis" : formatBRL(shippingPrice)}
						</span>
					</div>

					<div className="flex items-center gap-2 text-muted-foreground text-[11px] sm:text-xs">
						<Clock className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span>Previsão de 1 a 2 dias úteis após a colheita</span>
					</div>

					<div className="flex items-center gap-2 text-muted-foreground text-[11px] sm:text-xs">
						<CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span>Taxa fixa do produtor rural para toda a região</span>
					</div>
				</div>
			)}

			{/* Opção Adicional: Retirada no Local */}
			<div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-2.5 text-xs">
				<div className="flex items-center gap-2">
					<Store className="size-4 text-emerald-600 dark:text-emerald-400" />
					<span className="font-medium text-foreground">
						Retirada na Propriedade Rural
					</span>
				</div>
				<span className="font-semibold text-emerald-700 dark:text-emerald-300">
					Grátis
				</span>
			</div>
		</div>
	);
}
