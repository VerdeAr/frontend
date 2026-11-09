import {
	CheckCircle2,
	Clock,
	Loader2,
	Map as MapIcon,
	MapPin,
	Navigation,
	Store,
	Truck,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { DeliveryRouteMap } from "@/components/common";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { type ShippingCalculationResult, shippingService } from "@/services";
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
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculation, setCalculation] =
		useState<ShippingCalculationResult | null>(null);
	const [isMapExpanded, setIsMapExpanded] = useState(true);

	const selectedNeighborhood = neighborhoods.find(
		(n) => n.id === selectedNeighborhoodId,
	);

	useEffect(() => {
		let isMounted = true;

		async function computeShipping() {
			if (!selectedNeighborhood) {
				setCalculation(null);
				return;
			}

			setIsCalculating(true);
			try {
				const result = await shippingService.calculateShipping({
					neighborhoodName: selectedNeighborhood.name,
					baseFee:
						typeof sellerFixedShippingRate === "number" &&
						sellerFixedShippingRate >= 0
							? sellerFixedShippingRate
							: undefined,
				});

				if (isMounted) {
					setCalculation(result);
				}
			} catch (err) {
				console.error("Erro ao calcular frete dinâmico na PDP:", err);
			} finally {
				if (isMounted) {
					setIsCalculating(false);
				}
			}
		}

		computeShipping();

		return () => {
			isMounted = false;
		};
	}, [selectedNeighborhood, sellerFixedShippingRate]);

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
						Cálculo dinâmico pela distância real da fazenda até você
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
					<span>Selecione seu bairro para traçar a rota:</span>
				</label>

				<div className="relative w-full">
					<select
						id={selectId}
						value={selectedNeighborhoodId}
						onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
						disabled={isCalculating}
						className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:text-sm disabled:opacity-60"
					>
						<option value="">Selecione o bairro de entrega...</option>
						{neighborhoods.map((neighborhood) => (
							<option key={neighborhood.id} value={neighborhood.id}>
								{neighborhood.name}
								{neighborhood.city ? ` - ${neighborhood.city}` : ""}
							</option>
						))}
					</select>
					{isCalculating && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
							<Loader2 className="size-4 animate-spin text-emerald-600" />
						</div>
					)}
				</div>
			</div>

			{/* Resultado da Simulação com Cálculo Dinâmico */}
			{selectedNeighborhoodId && selectedNeighborhood && calculation && (
				<div className="flex flex-col gap-3 rounded-xl border border-emerald-600/20 bg-emerald-50/60 p-3.5 text-xs dark:bg-emerald-950/30 transition-all">
					<div className="flex items-center justify-between gap-2 border-b border-emerald-600/15 pb-2.5">
						<div className="flex flex-col">
							<span className="font-semibold text-foreground text-xs sm:text-sm">
								Entrega em {selectedNeighborhood.name}
							</span>
							<span className="text-[11px] text-muted-foreground">
								Rota calculada via OpenRouteService
							</span>
						</div>
						<div className="text-right">
							<span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300">
								{calculation.totalPrice === 0
									? "Grátis"
									: formatBRL(calculation.totalPrice)}
							</span>
						</div>
					</div>

					{/* Detalhamento da Fórmula Dinâmica */}
					<div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-0.5">
						<div className="flex items-center gap-1.5">
							<Navigation className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
							<span>
								Distância: <strong>{calculation.distanceKm} km</strong>
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Clock className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
							<span>
								Tempo estimado:{" "}
								<strong>~{calculation.durationMinutes} min</strong>
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between text-[11px] text-muted-foreground/80 bg-background/50 rounded-lg p-2 border border-border/40">
						<span>
							Fórmula: {formatBRL(calculation.baseFee)} base + (
							{calculation.distanceKm} km × {formatBRL(calculation.pricePerKm)}
							/km)
						</span>
						<button
							type="button"
							onClick={() => setIsMapExpanded((prev) => !prev)}
							className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 transition-colors"
						>
							<MapIcon className="size-3" />
							<span>{isMapExpanded ? "Ocultar Mapa" : "Ver Rota"}</span>
						</button>
					</div>

					{/* Mapa Interativo Renderizado */}
					{isMapExpanded && (
						<div className="pt-1 animate-in fade-in duration-300">
							<DeliveryRouteMap
								origin={calculation.origin}
								destination={calculation.destination}
								routeCoordinates={calculation.routeCoordinates}
								distanceKm={calculation.distanceKm}
								durationMinutes={calculation.durationMinutes}
								className="h-56 sm:h-64 rounded-xl"
							/>
						</div>
					)}

					<div className="flex items-center gap-2 text-muted-foreground text-[11px]">
						<CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span>
							Cálculo preciso direto da propriedade rural até o bairro
						</span>
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
